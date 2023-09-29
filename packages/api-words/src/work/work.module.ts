import { Module } from '@nestjs/common'
import { WorkGateway } from './workGateway'
import { WorkService } from './work.service'
import { WordsModule } from 'src/words/words.module'
import { ClientModule } from 'src/clients/client.module'

@Module({
  imports: [WordsModule, ClientModule],
  providers: [WorkGateway, WorkService],
})
export class WorkModule {}
