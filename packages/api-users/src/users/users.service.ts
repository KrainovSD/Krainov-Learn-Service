import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { User, UserCreationArgs } from './users.model'
import { Op } from 'sequelize'
import { SettingsService } from '../settings/settings.service'
import { Settings } from '../settings/settings.model'
import { MailerService } from '@nestjs-modules/mailer'
import { fsOperation, utils, node } from '../utils/helpers'
import {
  ERROR_MESSAGES,
  MAIL_MESSAGES_OPTION,
  RESPONSE_MESSAGES,
  SALT_ROUNDS,
} from '../const'
import { ChangePassDto } from './dto/change-pass.dto'
import { ChangeEmailDto } from './dto/change-email.dto'
import { ClientService } from '../clients/client.service'
import { UPLOAD_PATH_AVATAR, UPLOAD_PATH_WALLPAPER } from './users.constants'
import { DeleteUsersDto } from './dto/delete-users.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userRepo: typeof User,
    private readonly settingService: SettingsService,
    private readonly mailerService: MailerService,
    private readonly clientService: ClientService,
  ) {}

  private readonly forbiddenFields = [
    'hash',
    'confirmed',
    'token',
    'passwordChangeKey',
    'passwordChangeTime',
    'emailChangeKey',
    'emailChangeTime',
  ]
  private readonly privateFields = [
    'email',
    'passwordChangeDate',
    'emailChangeDate',
    'emailToChange',
    'nickNameChangeDate',
  ]

  async callChangePass(email: string, userId: string, traceId: string) {
    const user = await this.getUserByEmail(email)
    if (!user) throw new BadRequestException(ERROR_MESSAGES.badEmail)

    if (user.passwordChangeDate) {
      const lastDateChange = user.passwordChangeDate
      lastDateChange.setDate(lastDateChange.getDate() + 1)
      if (lastDateChange > new Date())
        throw new BadRequestException(ERROR_MESSAGES.oftenChage)
    }
    if (user.passwordChangeTime && user.passwordChangeTime > new Date())
      throw new BadRequestException(ERROR_MESSAGES.oftenTryChange)

    const passwordChangeKey = utils.common.getId()
    const passwordChangeTime = new Date()
    passwordChangeTime.setMinutes(passwordChangeTime.getMinutes() + 5)
    user.passwordChangeKey = passwordChangeKey
    user.passwordChangeTime = passwordChangeTime
    await user.save()
    // TODO: Починить почту
    // await this.sendMail(
    //   MAIL_MESSAGES_OPTION.changePassword.title,
    //   MAIL_MESSAGES_OPTION.changePassword.message,
    //   passwordChangeKey,
    //   email,
    // )

    return RESPONSE_MESSAGES.sendEmail
  }
  async changePass(dto: ChangePassDto, userId: string, traceId: string) {
    const user = await this.getUserByPasswordChangeKey(dto.key)
    if (
      !user ||
      (user &&
        user.passwordChangeTime &&
        user.passwordChangeTime < new Date()) ||
      (user && !user.passwordChangeTime)
    )
      throw new BadRequestException(ERROR_MESSAGES.badKeyOrTime)

    const hash = await node.hash(dto.password, SALT_ROUNDS)
    user.hash = hash
    user.passwordChangeDate = new Date()
    user.passwordChangeKey = null
    user.passwordChangeTime = null
    await user.save()

    return RESPONSE_MESSAGES.success
  }

  async callChangeEmail(userId: string, traceId: string) {
    const user = await this.getUserByIdService(userId)

    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound)

    if (user.emailChangeDate) {
      const lastDateChange = user.emailChangeDate
      lastDateChange.setDate(lastDateChange.getDate() + 1)
      if (lastDateChange > new Date())
        throw new BadRequestException(ERROR_MESSAGES.oftenChage)
    }
    if (user.emailChangeTime && user.emailChangeTime > new Date())
      throw new BadRequestException(ERROR_MESSAGES.oftenTryChange)

    const emailChangeKey = utils.common.getId()
    const emailChangeTime = new Date()
    emailChangeTime.setMinutes(emailChangeTime.getMinutes() + 5)
    user.emailChangeKey = emailChangeKey
    user.emailChangeTime = emailChangeTime
    await user.save()
    // TODO: Починить почту
    // await this.sendMail(
    //   MAIL_MESSAGES_OPTION.callChangeEmail.title,
    //   MAIL_MESSAGES_OPTION.callChangeEmail.message,
    //   passwordChangeKey,
    //   user.email,
    // )

    return RESPONSE_MESSAGES.sendEmail
  }
  async changeEmail(dto: ChangeEmailDto, userId: string, traceId: string) {
    const user = await this.getUserByEmailChangeKey(dto.key)

    if (
      !user ||
      (user && user.emailChangeTime && user.emailChangeTime < new Date()) ||
      (user && !user.emailChangeTime) ||
      (user && user.id !== userId) ||
      user.emailToChange
    )
      throw new BadRequestException(ERROR_MESSAGES.badKeyOrTime)

    await this.checkUniqueEmail(dto.email, traceId)

    user.emailToChange = dto.email
    const emailChangeKey = utils.common.getId()
    const emailChangeTime = new Date()
    emailChangeTime.setMinutes(emailChangeTime.getMinutes() + 5)
    user.emailChangeKey = emailChangeKey
    user.emailChangeTime = emailChangeTime
    await user.save()

    //TODO: Починить email
    // await this.sendMail(
    //   MAIL_MESSAGES_OPTION.regiser.title,
    //   MAIL_MESSAGES_OPTION.regiser.message,
    //   user.emailChangeKey,
    //   user.emailToChange,
    // )

    return RESPONSE_MESSAGES.sendNewEmail
  }

  async changeNickName(nickName: string, userId: string, traceId: string) {
    const user = await this.getUserByIdService(userId)
    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound)
    if (user.nickNameChangeDate) {
      const lastDateChange = user.nickNameChangeDate
      lastDateChange.setMonth(lastDateChange.getMonth() + 1)
      if (lastDateChange > new Date())
        throw new BadRequestException(ERROR_MESSAGES.changeNickName)
    }
    await this.checkUniqueNickName(nickName, traceId)

    user.nickName = nickName
    user.nickNameChangeDate = new Date()
    await user.save()
    return RESPONSE_MESSAGES.success
  }

  async clearAvatar(userId: string, traceId: string) {
    const user = await this.getUserById(userId, traceId)
    if (!user || !user.avatar)
      throw new BadRequestException(ERROR_MESSAGES.userNotFound)
    await fsOperation.removeFile(UPLOAD_PATH_AVATAR, user.avatar)
    user.avatar = null
    await user.save()
    return RESPONSE_MESSAGES.success
  }
  async updateAvatar(fileName: string, userId: string, traceId: string) {
    const user = await this.getUserById(userId, traceId)
    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound)
    if (user.avatar !== fileName) {
      if (user.avatar)
        await fsOperation.removeFile(UPLOAD_PATH_AVATAR, user.avatar)
      user.avatar = fileName
      await user.save()
    }
    return RESPONSE_MESSAGES.success
  }

  async clearWallpaper(userId: string, traceId: string) {
    const user = await this.getUserById(userId, traceId)
    if (!user || !user.wallpaper)
      throw new BadRequestException(ERROR_MESSAGES.userNotFound)
    await fsOperation.removeFile(UPLOAD_PATH_WALLPAPER, user.wallpaper)
    user.wallpaper = null
    await user.save()
    return RESPONSE_MESSAGES.success
  }
  async updateWallpaper(fileName: string, userId: string, traceId: string) {
    const user = await this.getUserById(userId, traceId)
    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound)
    if (user.wallpaper !== fileName) {
      if (user.wallpaper)
        await fsOperation.removeFile(UPLOAD_PATH_WALLPAPER, user.wallpaper)
      user.wallpaper = fileName
      await user.save()
    }
    return RESPONSE_MESSAGES.success
  }

  async createUser(dto: UserCreationArgs, traceId: string) {
    const user = this.userRepo.create(dto)
    const settings = this.settingService.createSettings(dto.id)
    this.clientService.createStatistics(dto.id, traceId)

    await Promise.all([user, settings])
    return RESPONSE_MESSAGES.success
  }

  async deleteUsers(dto: DeleteUsersDto, traceId: string) {
    this.clientService.deleteStatistics(dto.ids, traceId)
    this.clientService.deleteWords(dto.ids, traceId)
    await this.userRepo.destroy({
      where: {
        id: dto.ids,
      },
    })

    return RESPONSE_MESSAGES.success
  }

  async getUserByEmail(email: string) {
    return await this.userRepo.findOne({ where: { email } })
  }
  async getUserByNickName(nickName: string) {
    return await this.userRepo.findOne({ where: { nickName } })
  }
  async getUserByIdService(id: string) {
    return await this.userRepo.findByPk(id, {
      include: [Settings],
    })
  }
  async getUserById(
    id: string,
    traceId: string,
    privateFields: boolean = false,
  ) {
    return await this.userRepo.findByPk(id, {
      attributes: {
        exclude: privateFields
          ? this.forbiddenFields
          : [...this.forbiddenFields, ...this.privateFields],
      },
      include: [Settings],
    })
  }
  async getAllUser(userId: string, traceId: string) {
    return await this.userRepo.findAll({
      where: {
        id: {
          [Op.not]: userId,
        },
      },
      attributes: {
        exclude: [...this.forbiddenFields, ...this.privateFields],
      },
    })
  }
  async getUserByEmailChangeKey(key: string) {
    return await this.userRepo.findOne({ where: { emailChangeKey: key } })
  }
  async getUserByPasswordChangeKey(key: string) {
    return await this.userRepo.findOne({
      where: { passwordChangeKey: key },
    })
  }
  async getUserByEmailOrNickName(login: string) {
    return await this.userRepo.findOne({
      where: {
        [Op.or]: [
          {
            email: login.toLowerCase(),
          },
          {
            nickName: login,
          },
        ],
      },
    })
  }
  async getUserByTokenAndId(token: string, id: string) {
    return await this.userRepo.findOne({
      where: {
        [Op.and]: [{ token }, { id }],
      },
    })
  }
  async deleteUserById(id: string, traceId: string) {
    this.clientService.deleteStatistics([id], traceId)
    return await this.userRepo.destroy({ where: { id } })
  }

  async checkUniqueEmail(email: string, traceId: string) {
    const userByEmail = await this.getUserByEmail(email)
    if (userByEmail) {
      if (userByEmail.confirmed) {
        throw new BadRequestException(ERROR_MESSAGES.hasEmail)
      }
      await this.deleteUserById(userByEmail.id, traceId)
    }
  }
  async checkUniqueNickName(nickName: string, traceId: string) {
    const userByNickName = await this.getUserByNickName(nickName)
    if (userByNickName) {
      if (userByNickName.confirmed) {
        throw new BadRequestException(ERROR_MESSAGES.hasNickName)
      }
      await this.deleteUserById(userByNickName.id, traceId)
    }
  }
  private async sendMail(
    subject: string,
    text: string,
    code: string,
    email: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      from: process.env.MAIL_LOGIN,
      subject,
      text: `${text.trim()}: ${code.trim()}`,
      html: `${text.trim()}: ${code.trim()}`,
    })
  }
}
