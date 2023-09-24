import { FastifyReply, FastifyRequest } from 'fastify'
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { typings, uuid } from './helpers'
import { EventData, LoggerService } from './logger.service'
import { LOGGER_PROVIDER_MODULE } from './logger.constants'
import { RpcData } from './interfaces'

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(
    @Inject(LOGGER_PROVIDER_MODULE)
    private readonly loggerService: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp()
    const type = context.getType()

    if (type === 'rpc') {
      const request = ctx.getRequest<RpcData>()
      const response = ctx.getResponse<Record<string, any>>()

      const eventData: EventData = {
        pattern: response?.getPattern?.(),
        traceId: request?.traceId,
        sendBy: request?.sendBy,
      }

      this.loggerService.startEvent(eventData)

      return next.handle().pipe(
        tap(() => {
          this.loggerService.endEvent(eventData)
        }),
      )
    } else if (type === 'http') {
      const request = ctx.getRequest<FastifyRequest>()
      const response = ctx.getResponse<FastifyReply>()
      request.traceId = request.traceId ?? uuid()
      this.loggerService.startRequest(request)

      return next.handle().pipe(
        tap(() => {
          this.loggerService.endRequest({
            request,
            status: response.statusCode,
          })
        }),
      )
    }

    return next.handle()
  }
}
