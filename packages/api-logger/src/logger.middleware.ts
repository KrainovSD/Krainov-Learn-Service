import { uuid } from './helpers'
import { Injectable, NestMiddleware } from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor() {}
  use(
    request: FastifyRequest['raw'],
    response: FastifyReply['raw'],
    next: () => void,
  ) {
    next()
  }
}
