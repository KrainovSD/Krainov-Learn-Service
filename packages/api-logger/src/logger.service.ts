import { FastifyRequest } from 'fastify'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Inject, Injectable } from '@nestjs/common'
import { Logger } from 'winston'
import { typings } from './helpers'

export type TError = {
  error: unknown & Record<string, unknown>
}

export type EndRequest = {
  request: FastifyRequest
  status: number
  description?: string
}

export type EventData = {
  traceId: string | undefined
  pattern: string | undefined
  sendBy: string | undefined
}

export type EventError = {
  description?: string
  body?: string
} & TError

export type SendEvent = {
  traceId: string
  pattern: string
  data: string
  consumer: string
}

export type AnswerSuccess = {
  answer: string
} & SendEvent

export type AnswerError = SendEvent & TError

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
  endRequest(options: EndRequest) {
    const requestInfo = this.getRequestInfo(options?.request)
    const curl = this.getCurl(options?.request)
    this.logger.info('end request', {
      ...requestInfo,
      status: options?.status,
      description: options?.description,
      curl,
    })
  }
  errorRequest(
    request: FastifyRequest,
    error: unknown & Record<string, unknown>,
  ) {
    const requestInfo = this.getRequestInfo(request)
    const curl = this.getCurl(request)

    const { description, name, stack } = this.getErrorInfo(error)

    this.logger.error('error request', {
      name,
      stack,
      curl,
      description,
      ...requestInfo,
    })
  }

  startEvent(options: EventData) {
    this.logger.info('start event', {
      traceId: options?.traceId,
      pattern: options?.pattern,
      sendBy: options?.sendBy,
    })
  }
  endEvent(options: EventData) {
    this.logger.info('end event', {
      traceId: options?.traceId,
      pattern: options?.pattern,
      sendBy: options?.sendBy,
    })
  }
  errorEvent(options: EventData & EventError) {
    const { description, name, stack } = this.getErrorInfo(
      options.error,
      options.description,
    )

    this.logger.error('error event', {
      name,
      stack,
      description,
      traceId: options?.traceId,
      pattern: options?.pattern,
      sendBy: options?.sendBy,
      body: options?.body,
    })
  }

  sendEvent(options: SendEvent) {
    this.logger.info('send event', {
      traceId: options.traceId,
      data: options.data,
      consumer: options.consumer,
      pattern: options.pattern,
    })
  }
  answerSuccess(options: AnswerSuccess) {
    this.logger.info('answer success', {
      traceId: options.traceId,
      data: options.data,
      consumer: options.consumer,
      pattern: options.pattern,
      answer: options.answer,
    })
  }
  answerError(options: AnswerError) {
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
  error(error: unknown & Record<string, unknown>, message: string) {
    const description = typings.isString(error?.message)
      ? error.message
      : 'unknown description'
    const name = typings.isString(error?.name) ? error.name : 'unknown name'
    const stack = typings.isString(error?.stack) ? error.stack : 'unknown stack'
    this.logger.error(message, {
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
  private getErrorInfo(
    error: unknown & Record<string, unknown>,
    errorDescription?: string,
  ) {
    const description = errorDescription
      ? errorDescription
      : typings.isString(error?.message)
      ? error.message
      : 'unknown description'
    const name = typings.isString(error?.name) ? error.name : 'unknown name'
    const stack = typings.isString(error?.stack) ? error.stack : 'unknown stack'

    return { description, name, stack }
  }
}
