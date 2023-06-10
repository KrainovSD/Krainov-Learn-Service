import { Statistic } from 'src/statistics/statistics.model'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { User, UserCreationArgs } from './users.model'
import { Op } from 'sequelize'
import { StatisticsService } from 'src/statistics/statistics.service'
import { SettingsService } from 'src/settings/settings.service'
import { Settings } from 'src/settings/settings.model'
import { MailerService } from '@nestjs-modules/mailer'
import { fsAsync, utils } from 'src/utils/helpers'
import {
  ERROR_MESSAGES,
  MAIL_MESSAGES_OPTION,
  RESPONSE_MESSAGES,
  SALT_ROUNDS,
  UPLOAD_PATH,
} from 'src/const'
import { ChangePassDto } from './dto/change-pass.dto'
import bcrypt from 'bcryptjs'
import { ChangeEmailDto } from './dto/change-email.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userRepo: typeof User,
    private readonly statisticService: StatisticsService,
    private readonly settingService: SettingsService,
    private readonly mailerService: MailerService,
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

  async callChangePass(email: string) {
    const user = await this.getUserByEmail(email)

    if (!user) throw new BadRequestException('Неверный адрес электронной почты')

    if (user.passwordChangeDate) {
      const lastDateChange = user.passwordChangeDate
      lastDateChange.setDate(lastDateChange.getDate() + 1)
      if (lastDateChange > new Date())
        throw new BadRequestException(ERROR_MESSAGES.oftenChage)
    }
    if (user.passwordChangeTime && user.passwordChangeTime > new Date())
      throw new BadRequestException(ERROR_MESSAGES.oftenTryChange)

    const passwordChangeKey = utils.getRandomString()
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
  async changePass(dto: ChangePassDto) {
    const user = await this.getUserByPasswordChangeKey(dto.key)
    if (
      !user ||
      (user &&
        user.passwordChangeTime &&
        user.passwordChangeTime < new Date()) ||
      (user && !user.passwordChangeTime)
    )
      throw new BadRequestException(ERROR_MESSAGES.badKeyOrTime)

    const hash = await bcrypt.hash(dto.password, SALT_ROUNDS)
    user.hash = hash
    user.passwordChangeDate = new Date()
    user.passwordChangeKey = null
    user.passwordChangeTime = null
    await user.save()

    return RESPONSE_MESSAGES.success
  }

  async callChangeEmail(userId: number) {
    const user = await this.getUserUserByIdService(userId)

    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound)

    if (user.emailChangeDate) {
      const lastDateChange = user.emailChangeDate
      lastDateChange.setDate(lastDateChange.getDate() + 1)
      if (lastDateChange > new Date())
        throw new BadRequestException(ERROR_MESSAGES.oftenChage)
    }
    if (user.emailChangeTime && user.emailChangeTime > new Date())
      throw new BadRequestException(ERROR_MESSAGES.oftenTryChange)

    const emailChangeKey = utils.getRandomString()
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
  async changeEmail(dto: ChangeEmailDto, userId: number) {
    const user = await this.getUserByEmailChangeKey(dto.key)
    if (
      !user ||
      (user && user.emailChangeTime && user.emailChangeTime < new Date()) ||
      (user && !user.emailChangeTime) ||
      (user && user.id !== userId) ||
      user.emailToChange
    )
      throw new BadRequestException(ERROR_MESSAGES.badKeyOrTime)

    await this.checkUniqueEmail(dto.email)

    user.emailToChange = dto.email
    const emailChangeKey = utils.getRandomString()
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

  async changeNickName(nickName: string, userId: number) {
    const user = await this.getUserUserByIdService(userId)
    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound)
    if (user.nickNameChangeDate) {
      const lastDateChange = user.nickNameChangeDate
      lastDateChange.setMonth(lastDateChange.getMonth() + 1)
      if (lastDateChange > new Date())
        throw new BadRequestException(ERROR_MESSAGES.changeNickName)
    }
    await this.checkUniqueNickName(nickName)

    user.nickName = nickName
    user.nickNameChangeDate = new Date()
    await user.save()
    return RESPONSE_MESSAGES.success
  }

  async clearAvatar(userId: number) {
    const user = await this.getUserById(userId)
    if (!user || !user.avatar)
      throw new BadRequestException(ERROR_MESSAGES.userNotFound)
    await fsAsync.removeFile(UPLOAD_PATH, user.avatar)
    user.avatar = null
    await user.save()
    return RESPONSE_MESSAGES.success
  }
  async updateAvatar(file: Express.Multer.File, userId: number) {
    const user = await this.getUserById(userId)
    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound)
    user.avatar = file.filename
    await user.save()
    return RESPONSE_MESSAGES.success
  }

  async clearWallpaper(userId: number) {
    const user = await this.getUserById(userId)
    if (!user || !user.wallpaper)
      throw new BadRequestException(ERROR_MESSAGES.userNotFound)
    await fsAsync.removeFile(UPLOAD_PATH, user.wallpaper)
    user.wallpaper = null
    await user.save()
    return RESPONSE_MESSAGES.success
  }
  async updateWallpaper(file: Express.Multer.File, userId: number) {
    const user = await this.getUserById(userId)
    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound)
    user.wallpaper = file.filename
    await user.save()
    return RESPONSE_MESSAGES.success
  }

  async createUser(dto: UserCreationArgs) {
    const user = await this.userRepo.create(dto)
    const statistic = await this.statisticService.createStatistic(user.id)
    const settings = await this.settingService.createSettings(user.id)

    user.statistic = statistic
    user.settings = settings
    return user
  }
  async getUserByEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email } })
    return user
  }
  async getUserByNickName(nickName: string) {
    const user = await this.userRepo.findOne({ where: { nickName } })
    return user
  }
  async getUserUserByIdService(id: number) {
    const user = await this.userRepo.findByPk(id, {
      include: [Settings, Statistic],
    })
    return user
  }
  async getUserById(id: number, privateFields: boolean = false) {
    const user = await this.userRepo.findByPk(id, {
      attributes: {
        exclude: privateFields
          ? this.forbiddenFields
          : [...this.forbiddenFields, ...this.privateFields],
      },
      include: [Settings, Statistic],
    })
    return user
  }
  async getAllUser(userId: number) {
    // const user = await this.userRepo.findAll({where: {
    //   id:
    // }})
    //TODO: Узнать как искать по НЕ РАВНО
  }
  async getUserByEmailChangeKey(key: string) {
    const user = await this.userRepo.findOne({ where: { emailChangeKey: key } })
    return user
  }
  async getUserByPasswordChangeKey(key: string) {
    const user = await this.userRepo.findOne({
      where: { passwordChangeKey: key },
    })
    return user
  }
  async getUserByEmailOrNickName(login: string) {
    const user = await this.userRepo.findOne({
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
    return user
  }
  async getUserByTokenAndId(token: string, id: number) {
    const user = await this.userRepo.findOne({
      where: {
        [Op.and]: [{ token }, { id }],
      },
    })
    return user
  }
  async deleteUserById(id: number) {
    const user = await this.userRepo.destroy({ where: { id } })
    return user
  }

  async checkUniqueEmail(email: string) {
    const userByEmail = await this.getUserByEmail(email)
    if (userByEmail) {
      if (userByEmail.confirmed) {
        throw new BadRequestException(ERROR_MESSAGES.hasEmail)
      }
      await this.deleteUserById(userByEmail.id)
    }
  }
  async checkUniqueNickName(nickName: string) {
    const userByNickName = await this.getUserByNickName(nickName)
    if (userByNickName) {
      if (userByNickName.confirmed) {
        throw new BadRequestException(ERROR_MESSAGES.hasNickName)
      }
      await this.deleteUserById(userByNickName.id)
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
