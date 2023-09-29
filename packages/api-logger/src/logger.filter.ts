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
import { EventData, LoggerService } from './logger.service'
import { RpcData } from './interfaces'
import { throwError } from 'rxjs'

@Catch()
export class LoggerFilter implements ExceptionFilter {
  constructor(
    @Inject(LOGGER_PROVIDER_MODULE)
    private readonly loggerService: LoggerService,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const type = host.getType()

    const status = typings.isNumber(exception?.status)
      ? exception.status
      : HttpStatus.INTERNAL_SERVER_ERROR
    const message = typings.isString(exception?.message)
      ? exception.message
      : undefined

    const validationInfo =
      status === HttpStatus.BAD_REQUEST
        ? typings.isObject(exception?.messages)
          ? JSON.stringify(exception.messages)
          : undefined
        : undefined

    const initialValidateData =
      status === HttpStatus.BAD_REQUEST
        ? typings.isString(exception?.initialData)
          ? JSON.stringify(exception.initialData)
          : undefined
        : undefined

    if (type === 'rpc') {
      const request = ctx.getRequest<RpcData>()
      const response = ctx.getResponse<Record<string, any>>()

      const eventData: EventData = {
        pattern: response?.getPattern?.(),
        traceId: request?.traceId,
        sendBy: request?.sendBy,
      }

      this.loggerService.errorEvent({
        ...eventData,
        error: exception,
        description: validationInfo,
        body: initialValidateData,
      })

      return throwError(() => ({ status: 'error', message }))
    } else if (type === 'http') {
      const response = ctx.getResponse<FastifyReply>()
      const request = ctx.getRequest<FastifyRequest>()

      if (status === HttpStatus.INTERNAL_SERVER_ERROR)
        this.loggerService.errorRequest(request, exception)
      else
        this.loggerService.endRequest({
          request,
          status: status,
          description: validationInfo
            ? JSON.stringify(validationInfo)
            : message,
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

    this.loggerService.error(exception, 'strange type exception')
    return
  }
}
