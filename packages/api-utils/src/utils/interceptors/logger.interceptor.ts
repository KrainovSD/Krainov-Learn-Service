import { FastifyReply, FastifyRequest } from 'fastify'
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { uuid } from '../../helpers'
import { LoggerService } from '../../modules'

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<FastifyRequest>()
    const response = ctx.getResponse<FastifyReply>()
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
