import { services } from '../const'
import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { timeout } from 'rxjs'
import { events, messages, statistics } from './client.constants'
import { Transaction } from 'sequelize'

type ClientsKeys = 'statistics'

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

  async createStatistics(userId: string) {
    this.sendEventToMicroservice(statistics, events.createStatistics, userId)
  }
  async deleteStatistics(userId: string) {
    this.sendEventToMicroservice(statistics, events.deleteStatistics, userId)
  }
}
