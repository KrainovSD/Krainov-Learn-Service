import { Injectable, NestMiddleware } from '@nestjs/common'
import { TRequest } from 'src/auth/auth.service'
import { LoggerService } from 'src/logger/logger.service'
import { uuid } from '../helpers'
import { FastifyReply } from 'fastify'

@Injectable()
class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(request: TRequest, response: FastifyReply['raw'], next: () => void) {
    request.traceId = uuid()
    this.loggerService.start(request)

    response.on('finish', () => {
      this.loggerService.end({
        request,
        status: response.statusCode,
      })
    })

    next()
  }
}

export default LoggerMiddleware
