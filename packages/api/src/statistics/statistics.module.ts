import { StatisticsService } from './statistics.service'
import { StatisticsController } from './statistics.controller'

import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Statistic } from './statistics.model'
import { User } from 'src/users/users.model'
import { CategoriesModule } from 'src/words/categories/categories.module'
import { RepeatsModule } from 'src/words/repeats/repeats.module'
import { JwtModule } from '@nestjs/jwt'
import { SessionsModule } from 'src/words/sessions/sessions.module'
import { CacheModule } from 'src/cache/cache.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Statistic, User]),
    SessionsModule,
    CacheModule,
    forwardRef(() => CategoriesModule),
    forwardRef(() => RepeatsModule),
    JwtModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
