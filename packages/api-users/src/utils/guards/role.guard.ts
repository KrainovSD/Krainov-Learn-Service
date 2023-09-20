import { nestUtils } from '../helpers'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Observable } from 'rxjs'
import { UserInfo } from 'src/auth/auth.service'
import { ROLE_DECORATOR_KEY } from 'src/const'

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest()
    try {
      const requiredRole = this.reflector.getAllAndOverride<string>(
        ROLE_DECORATOR_KEY,
        [context.getHandler(), context.getClass()],
      )
      if (!requiredRole) {
        throw new Error()
      }
      const authHeader = req.headers.authorization
      if (!authHeader || typeof authHeader !== 'string') throw new Error()
      const authInfo = authHeader.split(' ')
      if (authInfo.length !== 2) throw new Error()
      const bearer = authInfo[0]
      const token = authInfo[1]
      if (bearer !== 'Bearer') throw new Error()
      const user: UserInfo = this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      })
      req.user = user
      if (user.role !== requiredRole) throw new Error()

      return true
    } catch (e) {
      throw new nestUtils.exceptions.ForbiddenException()
    }
  }
}
