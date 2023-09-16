import { typings } from '../../utils/helpers'
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common'
import { FastifyReply } from 'fastify'
import { TRequest } from 'src/auth/auth.service'
import { LoggerService } from 'src/logger/logger.service'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: Record<string, unknown>, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<FastifyReply>()
    const request = ctx.getRequest<TRequest>()
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
