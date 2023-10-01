import { ClientsModule } from '@nestjs/microservices'
import { ClientService } from './client.service'

import { Module } from '@nestjs/common'
import { services } from 'src/const'
import { getClientsOptions } from './client.options'

@Module({
  imports: [
    ClientsModule.register(
      getClientsOptions(services.statistics.alias, services.statistics.queue),
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
