import { WsException } from '@nestjs/websockets'
import { FastifyRequest } from 'fastify'
import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common'

export const TraceId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    let traceId: undefined | string
    const type = ctx.getType()

    switch (type) {
      case 'http': {
        const request = ctx.switchToHttp().getRequest<FastifyRequest>()
        traceId = request.traceId
        break
      }
      case 'ws': {
        const client = ctx.switchToWs().getClient()
        traceId = client?.traceId
        break
      }
    }

    if (!traceId) {
      switch (type) {
        case 'http': {
          throw new InternalServerErrorException("haven't traceId")
        }
        case 'ws': {
          throw new WsException({ message: "haven't traceId" })
        }
      }
    }

    return traceId
  },
)
