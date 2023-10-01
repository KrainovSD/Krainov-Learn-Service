import { FastifyRequest } from 'fastify'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Inject, Injectable } from '@nestjs/common'
import { Logger } from 'winston'
import { typings } from './helpers'
import { Client } from './typings'

export type ErrorType = unknown & Record<string, unknown>

export type TError = {
  error: ErrorType
}

export type EndRequestOptions = {
  request: FastifyRequest
  status: number
  description?: string
}

export type EventDataOptions = {
  traceId: string | undefined
  pattern: string | undefined
  sendBy: string | undefined
}

export type EventErrorOptions = {
  description?: string
  body?: string
} & TError

export type SendEventOptions = {
  traceId: string
  pattern: string
  data: string
  consumer: string
}

export type AnswerSuccessOptions = {
  answer: string
} & SendEventOptions

export type AnswerErrorOptions = SendEventOptions & TError

export type WsDataOptions = {
  client: Client
  pattern: string
  body: string
}

export type WsWarnOptions = WsDataOptions & {
  description?: string | undefined
  errorStatus?: number
}

@Injectable()
export class LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  startRequest(request: FastifyRequest) {
    const requestInfo = this.getRequestInfo(request)
    const curl = this.getCurl(request)

    this.logger.info('start request', {
      ...requestInfo,
      curl,
    })
  }
  endRequest(options: EndRequestOptions) {
    const { request, ...rest } = options
    const requestInfo = this.getRequestInfo(request)
    const curl = this.getCurl(request)

    this.logger.info('end request', {
      ...requestInfo,
      ...rest,
      curl,
    })
  }
  errorRequest(request: FastifyRequest, error: ErrorType) {
    const requestInfo = this.getRequestInfo(request)
    const curl = this.getCurl(request)

    const errorInfo = this.getErrorInfo(error)

    this.logger.error('error request', {
      curl,
      ...errorInfo,
      ...requestInfo,
    })
  }

  startWsMessage(options: WsDataOptions) {
    const { client, ...rest } = options
    const clientInfo = this.getClientInfo(client)
    this.logger.info('start ws message', {
      ...clientInfo,
      ...rest,
    })
  }
  endWsMessage(options: WsDataOptions) {
    const { client, ...rest } = options
    const clientInfo = this.getClientInfo(client)
    this.logger.info('end ws message', {
      ...clientInfo,
      ...rest,
    })
  }
  warnWsMessage(options: WsWarnOptions) {
    const { client, description, errorStatus, ...rest } = options

    const clientInfo = this.getClientInfo(options.client)

    this.logger.warn('warn ws message', {
      status: errorStatus,
      description,
      ...clientInfo,
      ...rest,
    })
  }
  errorWsMessage(options: WsDataOptions & TError) {
    const { client, error, ...rest } = options

    const clientInfo = this.getClientInfo(client)
    const errorInfo = this.getErrorInfo(error)

    this.logger.error('error request', {
      ...errorInfo,
      ...clientInfo,
      ...rest,
    })
  }

  startEvent(options: EventDataOptions) {
    this.logger.info('start event', {
      ...options,
    })
  }
  endEvent(options: EventDataOptions) {
    this.logger.info('end event', {
      ...options,
    })
  }
  errorEvent(options: EventDataOptions & EventErrorOptions) {
    const { error, description, ...rest } = options

    const errorInfo = this.getErrorInfo(error, description)

    this.logger.error('error event', {
      ...errorInfo,
      ...rest,
    })
  }

  sendEvent(options: SendEventOptions) {
    this.logger.info('send event', {
      traceId: options.traceId,
      data: options.data,
      consumer: options.consumer,
      pattern: options.pattern,
    })
  }
  answerSuccess(options: AnswerSuccessOptions) {
    this.logger.info('answer success', {
      traceId: options.traceId,
      data: options.data,
      consumer: options.consumer,
      pattern: options.pattern,
      answer: options.answer,
    })
  }
  answerError(options: AnswerErrorOptions) {
    const { description, name, stack } = this.getErrorInfo(options.error)

    this.logger.info('answer error', {
      traceId: options.traceId,
      data: options.data,
      consumer: options.consumer,
      pattern: options.pattern,
      description,
      name,
      stack,
    })
  }

  info(message: string, traceId: string) {
    this.logger.info(message, { traceId })
  }
  error(error: ErrorType, message: string) {
    const { description, name, stack } = this.getErrorInfo(error)
    this.logger.error(message, {
      name,
      stack,
      description,
    })
  }
  warn(error: ErrorType, message: string) {
    const { description, name, stack } = this.getErrorInfo(error)
    this.logger.warn(message, {
      name,
      stack,
      description,
    })
  }

  private getCurl(request: FastifyRequest) {
    if (!typings.isObject(request)) return null

    let headers = ''
    Object.keys(request.headers ?? {}).forEach(
      (r) => (headers += `--header '${r}: ${request.headers?.[String(r)]}' `),
    )

    const body = request.body
      ? `--data-raw '${JSON.stringify(request.body)}'`
      : ''

    const curl = `curl --location -g --request ${request.method?.toUpperCase()} '${
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
  private getErrorInfo(error: ErrorType, errorDescription?: string) {
    const description = errorDescription
      ? errorDescription
      : typings.isString(error?.message)
      ? error.message
      : 'unknown description'
    const name = typings.isString(error?.name) ? error.name : 'unknown name'
    const stack = typings.isString(error?.stack) ? error.stack : 'unknown stack'

    return { description, name, stack }
  }
  private getClientInfo(client: Client) {
    return {
      userId: client.user?.id,
      traceId: client.traceId,
      sessionId: client.id,
    }
  }
}
