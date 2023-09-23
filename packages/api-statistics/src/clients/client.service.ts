import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { timeout } from 'rxjs'
import { services } from 'src/const'
import { messages, users, words } from './client.constants'
import { LoggerService, logger } from 'src/utils/helpers'

type ClientsKeys = 'users' | 'words'

export type StreakInfo = {
  knownNormal: boolean
  knownReverse: boolean
  learnNormal: boolean
  learnReverse: boolean
  repeatNormal: boolean
  repeatReverse: boolean
  result: boolean
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
    value: unknown,
  ): Promise<T | null> {
    return new Promise((resolve, reject) => {
      this.clients[microservice]
        .send(pattern, value)
        .pipe(timeout(5000))
        .subscribe({
          next: (result) => {
            resolve(result)
          },
          error: (error) => {
            resolve(null)
          },
        })
    })
  }
  async sendEventToMicroservice(
    microservice: ClientsKeys,
    pattern: string,
    value: unknown,
  ) {
    this.clients[microservice].emit(pattern, value)
  }

  async getStreakInfo(userId: string) {
    return await this.sendMessageToMicroservice<StreakInfo>(
      words,
      messages.getStreak,
      userId,
    )
  }
  async getUserInfo(header: string) {
    return await this.sendMessageToMicroservice<UserInfo | null>(
      users,
      messages.checkAuth,
      header,
    )
  }
}
