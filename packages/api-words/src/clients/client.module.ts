import { ClientsModule } from '@nestjs/microservices'
import { ClientService } from './client.service'

import { Module } from '@nestjs/common'
import { services } from 'src/const'
import { getClientsOptions } from './client.options'

@Module({
  imports: [
    ClientsModule.register(
      getClientsOptions(services.users, process.env.RABBIT_QUEUE_USERS),
    ),
    ClientsModule.register(
      getClientsOptions(services.words, process.env.RABBIT_QUEUE_WORDS),
    ),
  ],
  controllers: [],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
