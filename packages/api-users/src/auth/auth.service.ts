import { FastifyRequest } from 'fastify'
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common'
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { UsersService } from 'src/users/users.service'
import { utils, node, uuid } from 'src/utils/helpers'
import { ConfirmDto } from './dto/confirm.dto'
import { MailerService } from '@nestjs-modules/mailer'
import { LoginDto } from './dto/login.dto'
import { User } from 'src/users/users.model'
import {
  ERROR_MESSAGES,
  MAIL_MESSAGES_OPTION,
  RESPONSE_MESSAGES,
  SALT_ROUNDS,
} from '../const'
import { JwtService } from 'src/jwt/jwt.service'

export type UserInfo = {
  id: string
  role: string
  subscription: Date | null
}

export type TRequest = FastifyRequest

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  async register(userDto: CreateUserDto, traceId: string) {
    await this.userService.checkUniqueEmail(userDto.email)
    await this.userService.checkUniqueNickName(userDto.nickName)
    const createUserDto = await this.getCreateUserDto(userDto)
    await this.userService.createUser(createUserDto, traceId)

    //TODO: Починить email
    // await this.sendMail(
    //   MAIL_MESSAGES_OPTION.regiser.title,
    //   MAIL_MESSAGES_OPTION.regiser.message,
    //   createUserDto.emailChangeKey,
    //   createUserDto.emailToChange,
    // )
    return RESPONSE_MESSAGES.sendEmail
  }

  async confirm(confirmDto: ConfirmDto, traceId: string) {
    const user = await this.userService.getUserByEmailChangeKey(confirmDto.key)
    if (
      !user ||
      (user && user?.emailChangeTime && user.emailChangeTime < new Date()) ||
      !user?.emailToChange
    )
      throw new BadRequestException(ERROR_MESSAGES.badKeyOrTime)
    user.confirmed = true
    user.email = user.emailToChange.toLowerCase()
    user.emailToChange = null
    user.emailChangeDate = new Date()
    user.emailChangeKey = null
    user.emailChangeTime = null
    await user.save()
    return RESPONSE_MESSAGES.success
  }

  async login(loginDto: LoginDto, traceId: string) {
    const user = await this.userService.getUserByEmailOrNickName(loginDto.login)
    if (!user) throw new BadRequestException('Неверный логин или пароль')
    const checkPassword = await node.compare(loginDto.password, user.hash)
    if (!checkPassword)
      throw new BadRequestException('Неверный логин или пароль')
    if (!user.confirmed) throw new BadRequestException('Аккаунт не подтвержден')

    user.token =
      user.token && (await this.jwtService.verifyToken(user.token, 'refresh'))
        ? user.token
        : await this.jwtService.generateToken(user, 'refresh')
    const access = await this.jwtService.generateToken(user, 'access')
    user.lastLogin = new Date()
    await user.save()

    return { access, refresh: user.token }
  }

  async token(refreshToken: string | undefined, traceId: string) {
    const decodedToken = await this.jwtService.verifyToken(
      refreshToken,
      'refresh',
    )
    if (!decodedToken || !refreshToken) throw new UnauthorizedException()
    const user = await this.userService.getUserByTokenAndId(
      refreshToken,
      decodedToken.id,
    )
    if (!user) throw new UnauthorizedException()
    const accessToken = await this.jwtService.generateToken(user, 'access')
    return { token: accessToken }
  }

  async logout(
    refreshToken: string | undefined,
    userInfo: UserInfo,
    traceId: string,
  ) {
    if (!refreshToken) throw new UnauthorizedException()
    const user = await this.userService.getUserByTokenAndId(
      refreshToken,
      userInfo.id,
    )
    if (!user) throw new UnauthorizedException()
    user.token = null
    await user.save()
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

  private async getCreateUserDto(userDto: CreateUserDto) {
    const hash = await node.hash(userDto.password, SALT_ROUNDS)
    const registrationDate = new Date()
    const emailChangeTime = utils.date.getDate(1, 'years')
    const emailChangeKey = utils.common.getId()

    return {
      id: uuid(),
      userName: userDto.userName,
      nickName: userDto.nickName,
      hash,
      registrationDate,
      emailChangeKey,
      emailChangeTime,
      emailToChange: userDto.email.toLowerCase(),
    }
  }
}
