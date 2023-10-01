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
import { EventDataOptions, LoggerService } from './logger.service'
import { LOGGER_PROVIDER_MODULE } from './logger.constants'
import { RpcData } from './interfaces'
import { Client } from './typings'

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(
    @Inject(LOGGER_PROVIDER_MODULE)
    private readonly loggerService: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const type = context.getType()

    if (type === 'rpc') {
      return this.interceptRpc(context, next)
    } else if (type === 'http') {
      return this.interceptHttp(context, next)
    } else if (type === 'ws') {
      return this.interceptWs(context, next)
    }

    return next.handle()
  }

  public interceptHttp(context: ExecutionContext, next: CallHandler) {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<FastifyRequest>()
    const response = ctx.getResponse<FastifyReply>()

    if (!request.traceId) {
      request.traceId = uuid()
    }

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
  public interceptRpc(context: ExecutionContext, next: CallHandler) {
    const ctx = context.switchToRpc()
    const data = ctx.getData<RpcData>()
    const rpcContext = ctx.getContext<Record<string, any>>()

    const eventData: EventDataOptions = {
      pattern: rpcContext?.getPattern?.(),
      traceId: data?.traceId,
      sendBy: data?.sendBy,
    }

    this.loggerService.startEvent(eventData)

    return next.handle().pipe(
      tap(() => {
        this.loggerService.endEvent(eventData)
      }),
    )
  }
  public interceptWs(context: ExecutionContext, next: CallHandler) {
    const ctx = context.switchToWs()

    const client = ctx.getClient<Client>()
    const pattern = ctx.getPattern()
    const body = JSON.stringify(ctx.getData())

    if (!client.traceId) {
      client.traceId = uuid()
    }
    this.loggerService.startWsMessage({ body, client, pattern })

    return next.handle().pipe(
      tap(() => {
        this.loggerService.endWsMessage({ body, client, pattern })
        client.traceId = undefined
      }),
    )
  }
}
