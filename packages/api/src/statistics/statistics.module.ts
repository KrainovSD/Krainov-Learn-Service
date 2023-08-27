import { StatisticsService } from './statistics.service'
import { StatisticsController } from './statistics.controller'

import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Statistic } from './statistics.model'
import { User } from 'src/users/users.model'
import { KnownsModule } from 'src/words/knowns/knowns.module'
import { CategoriesModule } from 'src/words/categories/categories.module'
import { RepeatsModule } from 'src/words/repeats/repeats.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Statistic, User]),
    forwardRef(() => KnownsModule),
    forwardRef(() => CategoriesModule),
    forwardRef(() => RepeatsModule),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
