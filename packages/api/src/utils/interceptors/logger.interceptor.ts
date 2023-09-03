import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { TRequest } from 'src/auth/auth.service'
import { LoggerService } from 'src/logger/logger.service'
import { uuid } from '../helpers'
import { Response } from 'express'

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<TRequest>()
    const response = ctx.getResponse<Response>()
    request.traceId = uuid()

    this.loggerService.start(request)

    return next.handle().pipe(
      tap(() => {
        this.loggerService.end({
          request,
          status: response.statusCode,
        })
      }),
    )
  }
}
