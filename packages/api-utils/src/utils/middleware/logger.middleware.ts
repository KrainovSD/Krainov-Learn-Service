import { Injectable, NestMiddleware } from '@nestjs/common'
import { uuid } from '../../helpers'
import { FastifyReply, FastifyRequest } from 'fastify'
import { LoggerService } from '../../modules'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

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
