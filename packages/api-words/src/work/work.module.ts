import { CategoriesModule } from '../categories/categories.module'
import { KnownsModule } from '../knowns/knowns.module'
import { LearnsModule } from '../learns/learns.module'
import { RepeatsModule } from '../repeats/repeats.module'
import { Module } from '@nestjs/common'
import { WorkGateway } from './workGateway'
import { JwtModule } from '@nestjs/jwt'
import { WorkService } from './work.service'
import { CacheModule } from 'src/cache/cache.module'
import { StatisticsModule } from 'src/statistics/statistics.module'
import { SessionsModule } from '../sessions/sessions.module'

@Module({
  imports: [
    SessionsModule,
    JwtModule,
    CacheModule,
    CategoriesModule,
    RepeatsModule,
    LearnsModule,
    KnownsModule,
    StatisticsModule,
  ],
  providers: [WorkGateway, WorkService],
})
export class WorkModule {}