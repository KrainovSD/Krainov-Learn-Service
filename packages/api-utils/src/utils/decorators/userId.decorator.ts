import { FastifyRequest } from 'fastify'
import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common'

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>()

    if (!request?.user) throw new UnauthorizedException()
    return request.user.id
  },
)
