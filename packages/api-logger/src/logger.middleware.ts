import { uuid } from './helpers'
import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'
import { LOGGER_PROVIDER_MODULE } from './logger.constants'
import { LoggerService } from './logger.service'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(LOGGER_PROVIDER_MODULE)
    private readonly loggerService: LoggerService,
  ) {}

  use(
    request: FastifyRequest,
    response: FastifyReply['raw'],
    next: () => void,
  ) {
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
