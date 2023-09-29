import { FastifyRequest } from 'fastify'
import { ExecutionContext, createParamDecorator } from '@nestjs/common'

export const TraceId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>()

    return request.traceId
  },
)
