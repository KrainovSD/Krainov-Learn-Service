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
import { LoggerService } from './logger.service'

@Catch()
export class LoggerFilter implements ExceptionFilter {
  constructor(
    @Inject(LOGGER_PROVIDER_MODULE)
    private readonly loggerService: LoggerService,
  ) {}

  catch(exception: Record<string, unknown>, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<FastifyReply>()
    const request = ctx.getRequest<FastifyRequest>()
    const status = typings.isNumber(exception?.status)
      ? exception.status
      : HttpStatus.INTERNAL_SERVER_ERROR
    const message = typings.isString(exception?.message)
      ? exception.message
      : undefined

    const validationInfo =
      status === HttpStatus.BAD_REQUEST
        ? typings.isObject(exception?.messages)
          ? exception.messages
          : undefined
        : undefined

    if (status === HttpStatus.INTERNAL_SERVER_ERROR)
      this.loggerService.error(request, exception)
    else
      this.loggerService.end({
        request,
        status: status,
        description: validationInfo ? JSON.stringify(validationInfo) : message,
      })

    response.status(status).send({
      statusCode: status,
      timestamp: new Date().toISOString(),
      traceId:
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? request.traceId
          : undefined,
      path: request.url,
      message:
        status === HttpStatus.INTERNAL_SERVER_ERROR ? undefined : message,
      validationInfo,
    })
  }
}
