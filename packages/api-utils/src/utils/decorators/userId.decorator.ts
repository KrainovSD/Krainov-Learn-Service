import { WsException } from '@nestjs/websockets'
import { FastifyRequest } from 'fastify'
import {
  ExecutionContext,
  InternalServerErrorException,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common'

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    let userId: undefined | string
    const type = ctx.getType()

    switch (type) {
      case 'http': {
        const request = ctx.switchToHttp().getRequest<FastifyRequest>()
        userId = request.user?.id
        break
      }
      case 'ws': {
        const client = ctx.switchToWs().getClient()
        userId = client?.user?.id
        break
      }
      default: {
        break
      }
    }

    if (!userId) {
      switch (type) {
        case 'http': {
          throw new InternalServerErrorException("haven't traceId")
        }
        case 'ws': {
          throw new WsException({ message: "haven't traceId" })
        }
        default: {
          throw new InternalServerErrorException('unknown type')
        }
      }
    }

    return userId
  },
)
