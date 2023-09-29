import { CategoriesModule } from '../categories/categories.module'
import { KnownsModule } from '../knowns/knowns.module'
import { LearnsModule } from '../learns/learns.module'
import { RepeatsModule } from '../repeats/repeats.module'
import { Module } from '@nestjs/common'
import { WorkGateway } from './workGateway'
import { WorkService } from './work.service'
import { WordsModule } from 'src/words/words.module'

@Module({
  imports: [WordsModule],
  providers: [WorkGateway, WorkService],
})
export class WorkModule {}
