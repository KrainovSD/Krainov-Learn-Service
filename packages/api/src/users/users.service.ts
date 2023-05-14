import { Statistic } from 'src/statistics/statistics.model'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { User, UserCreationArgs } from './users.model'
import { Op } from 'sequelize'
import { StatisticsService } from 'src/statistics/statistics.service'
import { SettingsService } from 'src/settings/settings.service'
import { Settings } from 'src/settings/settings.model'
import { MailerService } from '@nestjs-modules/mailer'
import { getRandomString } from 'src/utils/helpers'
import {
  ERROR_MESSAGES,
  MAIL_MESSAGES_OPTION,
  REQUEST_MESSAGES,
  SALT_ROUNDS,
} from 'src/const'
import { ChangePassDto } from './dto/change-pass.dto'
import bcrypt from 'bcryptjs'

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

    const passwordChangeKey = getRandomString()
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

    return REQUEST_MESSAGES.sendEmail
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

    return REQUEST_MESSAGES.success
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
  async getUserById(id: number, privateFields: boolean = false) {
    const user = await this.userRepo.findByPk(id, {
      attributes: {
        exclude: privateFields
          ? //FIXME: Исправить после отладки  ? this.forbiddenFields
            []
          : [...this.forbiddenFields, ...this.privateFields],
      },
      include: [Settings, Statistic],
    })
    return user
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
