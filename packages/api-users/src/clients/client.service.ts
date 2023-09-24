import { service, services } from '../const'
import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { timeout } from 'rxjs'
import { events, messages, statistics } from './client.constants'
import { Transaction } from 'sequelize'

type ClientsKeys = 'statistics'

type MessageValue = {
  traceId: string | undefined
  sendBy: string | undefined
  data: unknown
}

@Injectable()
export class ClientService {
  private clients: Record<ClientsKeys, ClientProxy> = {
    statistics: this.clientStatistics,
  }

  constructor(
    @Inject(services.statistics.alias) private clientStatistics: ClientProxy,
  ) {}

  async sendMessageToMicroservice<T extends unknown>(
    microservice: ClientsKeys,
    pattern: string,
    value: MessageValue,
  ): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.clients[microservice]
        .send(pattern, value)
        .pipe(timeout(5000))
        .subscribe({
          next: (result) => {
            resolve(result)
          },
          error: (error) => {
            resolve(undefined)
          },
        })
    })
  }
  async sendEventToMicroservice(
    microservice: ClientsKeys,
    pattern: string,
    value: MessageValue,
  ) {
    this.clients[microservice].emit(pattern, value)
  }

  async createStatistics(userId: string, traceId: string) {
    this.sendEventToMicroservice(statistics, events.createStatistics, {
      traceId,
      sendBy: service,
      data: {
        userId,
      },
    })
  }
  async deleteStatistics(userId: string, traceId: string) {
    this.sendEventToMicroservice(statistics, events.deleteStatistics, {
      traceId,
      sendBy: service,
      data: {
        userId,
      },
    })
  }
}
