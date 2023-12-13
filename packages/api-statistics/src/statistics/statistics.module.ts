import { StatisticsService } from './statistics.service'
import { StatisticsController } from './statistics.controller'

import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Statistic } from './statistics.model'
import { ClientModule } from '../clients/client.module'

@Module({
  imports: [SequelizeModule.forFeature([Statistic]), ClientModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
