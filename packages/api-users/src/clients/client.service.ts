import { service, services } from '../const'
import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { timeout } from 'rxjs'
import { events, statistics } from './client.constants'
import { LoggerService, logger } from 'src/utils'

type ClientsKeys = 'statistics'

type MessageValue<T = unknown> = {
  traceId: string | undefined
  sendBy: string | undefined
  data: T
}

type CRUDStatisticOptions = {
  userId: string
}

@Injectable()
export class ClientService {
  private clients: Record<ClientsKeys, ClientProxy> = {
    statistics: this.clientStatistics,
  }

  constructor(
    @Inject(services.statistics.alias) private clientStatistics: ClientProxy,
    @Inject(logger.LOGGER_PROVIDER_MODULE)
    private readonly logger: LoggerService,
  ) {}

  async sendMessageToMicroservice<T extends unknown>(
    microservice: ClientsKeys,
    pattern: string,
    value: MessageValue,
    traceId: string,
  ): Promise<T | undefined> {
    const loggerInfo = {
      consumer: microservice,
      data: JSON.stringify(value),
      pattern,
      traceId,
    }

    this.logger.sendEvent(loggerInfo)

    return new Promise((resolve, reject) => {
      this.clients[microservice]
        .send(pattern, value)
        .pipe(timeout(5000))
        .subscribe({
          next: (result) => {
            this.logger.answerSuccess({
              ...loggerInfo,
              answer: JSON.stringify(result),
            })

            resolve(result)
          },
          error: (error) => {
            this.logger.answerError({
              ...loggerInfo,
              error,
            })

            resolve(undefined)
          },
        })
    })
  }
  async sendEventToMicroservice(
    microservice: ClientsKeys,
    pattern: string,
    value: MessageValue,
    traceId: string,
  ) {
    this.logger.sendEvent({
      consumer: microservice,
      pattern,
      traceId,
      data: JSON.stringify(value),
    })

    this.clients[microservice].emit(pattern, value)
  }

  async createStatistics(userId: string, traceId: string) {
    const args: MessageValue<CRUDStatisticOptions> = {
      traceId,
      sendBy: service,
      data: {
        userId,
      },
    }
    this.sendEventToMicroservice(
      statistics,
      events.createStatistics,
      args,
      traceId,
    )
  }
  async deleteStatistics(userId: string, traceId: string) {
    const args: MessageValue<CRUDStatisticOptions> = {
      traceId,
      sendBy: service,
      data: {
        userId,
      },
    }
    this.sendEventToMicroservice(
      statistics,
      events.deleteStatistics,
      args,
      traceId,
    )
  }
}
