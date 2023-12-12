import { ClientsModule } from '@nestjs/microservices'
import { ClientService } from './client.service'

import { Module } from '@nestjs/common'
import { services } from '../const'
import { getClientsOptions } from './client.options'

@Module({
  imports: [
    ClientsModule.register(
      getClientsOptions(services.users.alias, services.users.queue),
    ),
    ClientsModule.register(
      getClientsOptions(services.words.alias, services.words.queue),
    ),
  ],
  controllers: [],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
