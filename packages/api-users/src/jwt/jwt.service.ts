import { Injectable } from '@nestjs/common'
import { User } from 'src/users/users.model'
import { EXPIRES_ACCESS_TOKEN, EXPIRES_REFRESH_TOKEN } from './jwt.constants'
import { JwtService as JWT } from '@nestjs/jwt'

@Injectable()
export class JwtService {
  constructor(private readonly jwtService: JWT) {}

  async getUserInfo(header: string, traceId: string) {
    const authInfo = header.split(' ')
    if (authInfo.length !== 2) return null
    const bearer = authInfo[0]
    const token = authInfo[1]

    if (
      process.env.SWAGGER_ACCOUNT_ID &&
      bearer === 'Basic' &&
      token === process.env.SWAGGER_BASIC_AUTH
    ) {
      const user: UserInfo = {
        id: process.env.SWAGGER_ACCOUNT_ID,
        role: 'user',
        subscription: null,
      }
      return user
    }

    if (bearer !== 'Bearer') return null

    const user = await this.verifyToken(token, 'access')
    return user
  }
  async generateToken(user: User, type: 'refresh' | 'access') {
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
  async verifyToken(
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
