import { CategoriesModule } from '../categories/categories.module'
import { WordsController } from './words.controller'
import { WordsService } from './words.service'

import { Module, forwardRef } from '@nestjs/common'
import { LearnsModule } from '../learns/learns.module'
import { KnownsModule } from '../knowns/knowns.module'
import { RepeatsModule } from '../repeats/repeats.module'
import { RelevancesModule } from '../relevances/relevances.module'
import { SessionsModule } from '../sessions/sessions.module'
import { ClientModule } from '../clients/client.module'

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
