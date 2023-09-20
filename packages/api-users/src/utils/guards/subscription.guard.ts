import { Observable } from 'rxjs'
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { UserInfo } from 'src/auth/auth.service'
import { JwtService } from '@nestjs/jwt'
import { nestUtils } from '../helpers'

@Injectable()
export class SubscribeGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest()
    try {
      const authHeader = req.headers.authorization
      if (!authHeader || typeof authHeader !== 'string') throw new Error()
      const authInfo = authHeader.split(' ')
      if (authInfo.length !== 2) throw new Error()
      const bearer = authInfo[0]
      const token = authInfo[1]
      if (bearer !== 'Bearer') throw new Error()
      const user = this.jwtService.verify<UserInfo>(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      })
      if (
        !user.subscription ||
        (user.subscription && user.subscription < new Date())
      )
        throw new Error()
      req.user = user
      return true
    } catch (e) {
      throw new nestUtils.exceptions.ForbiddenException()
    }
  }
}
