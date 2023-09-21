import { ClientsModule } from '@nestjs/microservices'
import { ClientService } from './client.service'

import { Module } from '@nestjs/common'
import { getClientsOptions } from 'src/options'
import { services } from 'src/const'

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
