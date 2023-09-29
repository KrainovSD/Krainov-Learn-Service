import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { timeout } from 'rxjs'
import { logger, LoggerService } from 'src/utils'
import { messages, statistics, users } from './client.constants'
import { service, services } from 'src/const'

type ClientsKeys = 'users' | 'statistics'

type MessageValue<T = unknown> = {
  traceId: string | undefined
  sendBy: string | undefined
  data: T
}

type AuthOptions = {
  header: string
}

type RegisterStreakOptions = {
  userId: string
  knownNormal: boolean
  knownReverse: boolean
  learnNormal: boolean
  learnReverse: boolean
  repeatNormal: boolean
  repeatReverse: boolean
}

type GetUserSettingsOptions = {
  userId: string
}

@Injectable()
export class ClientService {
  private clients: Record<ClientsKeys, ClientProxy> = {
    users: this.clientUsers,
    statistics: this.clientStatistics,
  }

  constructor(
    @Inject(services.users) private clientUsers: ClientProxy,
    @Inject(services.statistics) private clientStatistics: ClientProxy,
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
      pattern,
      traceId,
      data: JSON.stringify(value),
    })

    this.clients[microservice].emit(pattern, value)
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
  async registerStreak(
    streakInfo: StreakInfo,
    userId: string,
    traceId: string,
  ) {
    const args: MessageValue<RegisterStreakOptions> = {
      traceId,
      sendBy: service,
      data: {
        userId,
        ...streakInfo,
      },
    }

    return await this.sendMessageToMicroservice<boolean>(
      statistics,
      messages.registerStreak,
      args,
      traceId,
    )
  }
  async getUserSettings(userId: string, traceId: string) {
    const args: MessageValue<GetUserSettingsOptions> = {
      traceId,
      sendBy: service,
      data: {
        userId,
      },
    }

    return await this.sendMessageToMicroservice<UserSettings | null>(
      users,
      messages.userSettings,
      args,
      traceId,
    )
  }
}
