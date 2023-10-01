import { WsException } from '@nestjs/websockets'
import { typings } from './helpers'
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Inject,
} from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'
import { LOGGER_PROVIDER_MODULE } from './logger.constants'
import { EventDataOptions, LoggerService } from './logger.service'
import { RpcData } from './interfaces'
import { throwError } from 'rxjs'
import { Client } from './typings'

@Catch()
export class LoggerFilter implements ExceptionFilter {
  constructor(
    @Inject(LOGGER_PROVIDER_MODULE)
    private readonly loggerService: LoggerService,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const type = host.getType()

    if (type === 'rpc') {
      return this.rpcFilter(exception, host)
    } else if (type === 'http') {
      return this.httpFilter(exception, host)
    } else if (type === 'ws') {
      return this.wsFilter(exception, host)
    }
    this.loggerService.error(exception, 'strange type host')
    return
  }

  public httpFilter(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<FastifyReply>()
    const request = ctx.getRequest<FastifyRequest>()

    const { status, validationInfo, message } = this.getErrorInfo(exception)

    if (status === HttpStatus.INTERNAL_SERVER_ERROR)
      this.loggerService.errorRequest(request, exception)
    else
      this.loggerService.endRequest({
        request,
        status: status,
        description: validationInfo ? JSON.stringify(validationInfo) : message,
      })

    return response.status(status).send({
      statusCode: status,
      timestamp: new Date().toISOString(),
      traceId: request.traceId,
      path: request.url,
      message:
        status === HttpStatus.INTERNAL_SERVER_ERROR ? undefined : message,
      validationInfo,
    })
  }
  public rpcFilter(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToRpc()
    const data = ctx.getData<RpcData>()
    const rpcContext = ctx.getContext<Record<string, any>>()

    const { initialValidateData, validationInfo, message } =
      this.getErrorInfo(exception)

    const eventData: EventDataOptions = {
      pattern: rpcContext?.getPattern?.(),
      traceId: data?.traceId,
      sendBy: data?.sendBy,
    }

    this.loggerService.errorEvent({
      ...eventData,
      error: exception,
      description: validationInfo,
      body: initialValidateData,
    })

    return throwError(() => ({ status: 'error', message }))
  }
  public wsFilter(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToWs()

    const client = ctx.getClient<Client>()
    const pattern = ctx.getPattern()
    const body = JSON.stringify(ctx.getData())

    const { status, validationInfo, message } = this.getErrorInfo(exception)

    const wsCloseCode =
      status === HttpStatus.INTERNAL_SERVER_ERROR || status < 1000
        ? 1011
        : status
    const reason = JSON.stringify({
      name: typings.isString(exception?.name) ? exception.name : 'unknown name',
      description: message ?? 'unknown description',
    })

    if (status === HttpStatus.INTERNAL_SERVER_ERROR)
      this.loggerService.errorWsMessage({
        body,
        client,
        pattern: !typings.isString(pattern) ? JSON.stringify(pattern) : pattern,
        error: exception,
      })
    else
      this.loggerService.warnWsMessage({
        client,
        body,
        pattern: !typings.isString(pattern) ? JSON.stringify(pattern) : pattern,
        description: validationInfo ?? message,
        errorStatus: status,
      })

    client.close(wsCloseCode, reason)
    return new WsException(reason)
  }
  public getErrorInfo(exception: any) {
    if (typings.isObject(exception?.error)) {
      exception = exception.error
    }

    const status = typings.isNumber(exception?.status)
      ? exception.status
      : HttpStatus.INTERNAL_SERVER_ERROR

    const message = typings.isString(exception?.message)
      ? exception.message
      : undefined

    const validationInfo = typings.isObject(exception?.messages)
      ? JSON.stringify(exception.messages)
      : undefined

    const initialValidateData = typings.isString(exception?.initialData)
      ? JSON.stringify(exception.initialData)
      : undefined

    return { status, validationInfo, initialValidateData, message }
  }
}
