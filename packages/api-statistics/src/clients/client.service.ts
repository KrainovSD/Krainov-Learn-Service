import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { timeout } from 'rxjs'
import { service, services } from 'src/const'
import { messages, users, words } from './client.constants'
import { LoggerService, logger } from 'src/utils/helpers'

type ClientsKeys = 'users' | 'words'

type MessageValue<T = unknown> = {
  traceId: string | undefined
  sendBy: string | undefined
  data: T
}

type StreakOptions = {
  userId: string
}

type AuthOptions = {
  header: string
}

@Injectable()
export class ClientService {
  private clients: Record<ClientsKeys, ClientProxy> = {
    users: this.clientUsers,
    words: this.clientWords,
  }

  constructor(
    @Inject(services.users.alias) private clientUsers: ClientProxy,
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
    value: unknown,
    traceId: string,
  ) {
    this.logger.sendEvent({
      consumer: microservice,
      data: JSON.stringify(value),
      pattern,
      traceId,
    })

    this.clients[microservice].emit(pattern, value)
  }

  async getStreakInfo(userId: string, traceId: string) {
    const args: MessageValue<StreakOptions> = {
      traceId,
      sendBy: service,
      data: {
        userId,
      },
    }
    return await this.sendMessageToMicroservice<StreakInfo>(
      words,
      messages.getStreak,
      args,
      traceId,
    )
  }
  async getUserInfo(header: string, traceId: string) {
    const args: MessageValue<AuthOptions> = {
      traceId,
      sendBy: service,
      data: {
        header,
      },
    }
    return await this.sendMessageToMicroservice<UserInfo | null>(
      users,
      messages.checkAuth,
      args,
      traceId,
    )
  }
}
