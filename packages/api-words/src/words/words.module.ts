import { CategoriesModule } from 'src/categories/categories.module'
import { WordsController } from './words.controller'
import { WordsService } from './words.service'

import { Module, forwardRef } from '@nestjs/common'
import { LearnsModule } from 'src/learns/learns.module'
import { KnownsModule } from 'src/knowns/knowns.module'
import { RepeatsModule } from 'src/repeats/repeats.module'
import { RelevancesModule } from 'src/relevances/relevances.module'
import { SessionsModule } from 'src/sessions/sessions.module'
import { ClientModule } from 'src/clients/client.module'

@Module({
  imports: [
    forwardRef(() => CategoriesModule),
    forwardRef(() => LearnsModule),
    forwardRef(() => KnownsModule),
    forwardRef(() => RepeatsModule),
    forwardRef(() => RelevancesModule),
    ClientModule,
    SessionsModule,
  ],
  controllers: [WordsController],
  providers: [WordsService],
  exports: [WordsService, ClientModule],
})
export class WordsModule {}
