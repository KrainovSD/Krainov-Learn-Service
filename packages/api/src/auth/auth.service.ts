import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { UsersService } from 'src/users/users.service'
import { HasPropertyException } from 'src/utils/exceptions/hasProperty.exception'
import * as bcrypt from 'bcryptjs'
import { getRandomString } from 'src/utils/helpers'
import { ConfirmDto } from './dto/confirm.dto'
import { MailerService } from '@nestjs-modules/mailer'
import { LoginDto } from './dto/login.dto'
import { User } from 'src/users/users.model'
import {
  EXPIRES_ACCESS_TOKEN,
  EXPIRES_REFRESH_TOKEN,
  LINK_TO_CONFIRM,
} from '../const'

export type UserInfo = {
  id: number
  role: string
  subscription: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  async register(userDto: CreateUserDto) {
    await this.checkUniqueEmailAndNickName(userDto)
    const createUserDto = await this.getCreateUserDto(userDto)
    const user = await this.userService.createUser(createUserDto)
    await this.sendMail(
      'Активация аккаунта',
      'Чтобы подтвердить свой Email на Krainov Learn Service и активировать аккаунт, пройдите по ссылке',
      `${LINK_TO_CONFIRM}/${createUserDto.emailChangeKey}`,
      createUserDto.emailToChange,
    )
    return user
  }
  private async checkUniqueEmailAndNickName(userDto: CreateUserDto) {
    const userByEmail = await this.userService.getUserByEmail(userDto.email)
    if (userByEmail) {
      if (userByEmail.confirmed) {
        throw new HasPropertyException('адрес электронной почты')
      }
      await this.userService.deleteUserById(userByEmail.id)
    }
    const userByNickName = await this.userService.getUserByNickName(
      userDto.nickName,
    )
    if (userByNickName) {
      if (userByNickName.confirmed) {
        throw new HasPropertyException('псевдоним')
      }
      await this.userService.deleteUserById(userByNickName.id)
    }
  }
  private async getCreateUserDto(userDto: CreateUserDto) {
    const hash = await bcrypt.hash(userDto.password, 10)
    const registrationDate = new Date()
    const emailChangeTime = new Date()
    emailChangeTime.setFullYear(emailChangeTime.getFullYear() + 1)
    const emailChangeKey = getRandomString()

    return {
      userName: userDto.userName,
      nickName: userDto.nickName,
      hash,
      registrationDate,
      emailChangeKey,
      emailChangeTime,
      emailToChange: userDto.email.toLowerCase(),
    }
  }

  async confirm(confirmDto: ConfirmDto) {
    const user = await this.userService.getUserByEmailChangeKey(confirmDto.key)
    if (
      !user ||
      (user && user?.emailChangeTime && user.emailChangeTime < new Date()) ||
      !user?.emailToChange
    )
      throw new BadRequestException(
        'Ключ не корректен или истекло время операции',
      )
    user.confirmed = true
    user.email = user.emailToChange.toLowerCase()
    user.emailToChange = null
    user.emailChangeDate = new Date()
    user.emailChangeKey = null
    user.emailChangeTime = null
    await user.save()
    return user
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.getUserByEmailOrNickName(loginDto.login)
    if (!user) throw new BadRequestException('Неверный логин или пароль')
    const checkPassword = await bcrypt.compare(loginDto.password, user.hash)
    if (!checkPassword)
      throw new BadRequestException('Неверный логин или пароль')
    if (!user.confirmed) throw new BadRequestException('Аккаунт не подтвержден')

    user.token =
      user.token && (await this.verifyToken(user.token, 'refresh'))
        ? user.token
        : await this.generateToken(user, 'refresh')
    const access = await this.generateToken(user, 'access')
    user.lastLogin = new Date()
    await user.save()

    return { access, refresh: user.token }
  }

  async token(refreshToken: string | undefined) {
    const decodedToken = await this.verifyToken(refreshToken, 'refresh')
    if (!decodedToken || !refreshToken) throw new UnauthorizedException()
    const user = await this.userService.getUserByTokenAndId(
      refreshToken,
      decodedToken.id,
    )
    if (!user) throw new UnauthorizedException()
    const accessToken = await this.generateToken(user, 'access')
    return { token: accessToken }
  }

  async logout(refreshToken: string | undefined, userInfo: UserInfo) {
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
    link: string,
    email: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      from: process.env.MAIL_LOGIN,
      subject,
      text: `${text.trim()}: ${link.trim()}`,
      html: `${text.trim()}: <a href=${link.trim()}>Подтвердить</a>`,
    })
  }
  private async generateToken(user: User, type: 'refresh' | 'access') {
    const payload = {
      id: user.id,
      role: user.role,
      subscription: user.subscription,
    }
    const options =
      type === 'refresh'
        ? {
            expiresIn: EXPIRES_REFRESH_TOKEN,
            secret: process.env.REFRESH_TOKEN_SECRET,
          }
        : {
            expiresIn: EXPIRES_ACCESS_TOKEN,
            secret: process.env.ACCESS_TOKEN_SECRET,
          }
    return this.jwtService.sign(payload, options)
  }
  private async verifyToken(
    token: any,
    type: 'refresh' | 'access',
  ): Promise<UserInfo | null> {
    const options =
      type === 'refresh'
        ? {
            secret: process.env.REFRESH_TOKEN_SECRET,
          }
        : {
            secret: process.env.ACCESS_TOKEN_SECRET,
          }

    try {
      if (!token || typeof token !== 'string') throw new Error()
      const decoded = await this.jwtService.verify(token, options)
      return decoded
    } catch (e) {
      return null
    }
  }
}
