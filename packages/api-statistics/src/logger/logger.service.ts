import { FastifyRequest } from 'fastify'
import { typings } from '../utils/helpers'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Inject, Injectable, Scope } from '@nestjs/common'
import { Logger } from 'winston'
import { REQUEST } from '@nestjs/core'

type End = {
  request: FastifyRequest
  status: number
  description?: string
}

//FIXME: Выяснить что логировать и как прокидывать трейс

@Injectable()
export class LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  start(request: FastifyRequest) {
    const requestInfo = this.getRequestInfo(request)
    const curl = this.getCurl(request)

    this.logger.info('start request', {
      ...requestInfo,
      curl,
    })
  }

  end({ request, status, description }: End) {
    const requestInfo = this.getRequestInfo(request)
    const curl = this.getCurl(request)
    this.logger.info('stop request', {
      ...requestInfo,
      status,
      description,
      curl,
    })
  }

  info(message: string, traceId: string) {
    this.logger.info(message, { traceId })
  }

  error(request: FastifyRequest, error: unknown & Record<string, unknown>) {
    const requestInfo = this.getRequestInfo(request)
    const curl = this.getCurl(request)
    if (!error) {
      this.logger.error('unknown Error')
      return
    }
    const message = typings.isString(error?.message)
      ? error.message
      : 'unknown message'
    const name = typings.isString(error?.name) ? error.name : 'unknown name'
    const stack = typings.isString(error?.stack) ? error.stack : 'unknown stack'
    this.logger.error(message, {
      name,
      stack,
      curl,
      ...requestInfo,
    })
  }

  private getCurl(request: FastifyRequest) {
    if (!request) return null

    let headers = ''
    Object.keys(request?.headers ?? {}).forEach(
      (r) => (headers += `--header '${r}: ${request.headers?.[String(r)]}' `),
    )

    const body = request?.body
      ? `--data-raw '${JSON.stringify(request?.body)}'`
      : ''

    const curl = `curl --location -g --request ${request.method.toUpperCase()} '${
      request.url
    }' ${headers} ${body}`

    return curl.trim()
  }
  private getRequestInfo(request: FastifyRequest) {
    const ip = request.ip
    const host = request.hostname
    const userId = request.user?.id
    const traceId = request.traceId
    const protocol = request.protocol
    return { ip, host, userId, traceId, protocol }
  }
}
