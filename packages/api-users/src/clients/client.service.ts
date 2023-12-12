import { service, services } from '../const'
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { timeout } from 'rxjs'
import { events, statistics, words } from './client.constants'
import { LoggerService, logger } from '../utils'

type ClientsKeys = 'statistics' | 'words'

type MessageValue<T = unknown> = {
  traceId: string | undefined
  sendBy: string | undefined
  data: T
}

type CreateStatisticOptions = {
  userId: string
}

type DeleteStatisticsOptions = {
  userIds: string[]
}

type DeleteWordsOptions = {
  userIds: string[]
}

@Injectable()
export class ClientService {
  private clients: Record<ClientsKeys, ClientProxy> = {
    statistics: this.clientStatistics,
    words: this.clientWords,
  }

  constructor(
    @Inject(services.statistics.alias) private clientStatistics: ClientProxy,
    @Inject(services.words.alias) private clientWords: ClientProxy,

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
    const args: MessageValue<CreateStatisticOptions> = {
      traceId,
      sendBy: service,
      data: {
        userId,
      },
    }

    await this.sendEventToMicroservice(
      statistics,
      events.createStatistics,
      args,
      traceId,
    )
  }
  async deleteStatistics(userIds: string[], traceId: string) {
    const args: MessageValue<DeleteStatisticsOptions> = {
      traceId,
      sendBy: service,
      data: {
        userIds,
      },
    }
    await this.sendEventToMicroservice(
      statistics,
      events.deleteStatistics,
      args,
      traceId,
    )
  }

  async deleteWords(userIds: string[], traceId: string) {
    const args: MessageValue<DeleteWordsOptions> = {
      traceId,
      sendBy: service,
      data: {
        userIds,
      },
    }

    await this.sendEventToMicroservice(words, events.deleteWords, args, traceId)
  }
}
