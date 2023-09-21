import { services } from './../../../api-words/src/const'
import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { timeout } from 'rxjs'

type ClientsKeys = 'users' | 'statistics'

@Injectable()
export class ClientService {
  private clients: Record<ClientsKeys, ClientProxy> = {
    users: this.clientUsers,
    statistics: this.clientStatistics,
  }

  constructor(
    @Inject(services.users) private clientUsers: ClientProxy,
    @Inject(services.statistics) private clientStatistics: ClientProxy,
  ) {}

  async sendMessageToMicroservice<T extends unknown>(
    microservice: ClientsKeys,
    pattern: string,
    value: unknown,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.clients[microservice]
        .send(pattern, value)
        .pipe(timeout(5000))
        .subscribe({
          next: (result) => {
            resolve(result)
          },
          error: (error) => {
            reject(error)
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
}