import { StatisticsService } from './statistics.service'
import { StatisticsController } from './statistics.controller'

import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Statistic } from './statistics.model'
import { User } from 'src/users/users.model'

@Module({
  imports: [SequelizeModule.forFeature([Statistic, User])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
