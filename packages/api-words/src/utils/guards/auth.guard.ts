import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Observable } from 'rxjs'
import { TRequest, UserInfo } from 'src/auth/auth.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<TRequest>()
    try {
      const authHeader = req.headers.authorization
      if (!authHeader || typeof authHeader !== 'string') throw new Error()
      const authInfo = authHeader.split(' ')
      if (authInfo.length !== 2) throw new Error()
      const bearer = authInfo[0]
      const token = authInfo[1]
      if (
        bearer === 'Basic' &&
        token === process.env.SWAGGER_BASIC_AUTH &&
        process.env.SWAGGER_ACCOUNT_ID
      ) {
        const user: UserInfo = {
          id: process.env.SWAGGER_ACCOUNT_ID,
          role: 'user',
          subscription: null,
        }
        req.user = user
        return true
      }

      if (bearer !== 'Bearer') throw new Error()
      const user = this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      })
      req.user = user
      return true
    } catch (e) {
      throw new UnauthorizedException()
    }
  }
}
