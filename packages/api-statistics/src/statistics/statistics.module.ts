import { StatisticsService } from './statistics.service'
import { StatisticsController } from './statistics.controller'

import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Statistic } from './statistics.model'
import { JwtModule } from '@nestjs/jwt'
import { ClientModule } from '../clients/client.module'

@Module({
  imports: [SequelizeModule.forFeature([Statistic]), JwtModule, ClientModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
