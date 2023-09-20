import { StatisticsService } from './statistics.service'
import { StatisticsController } from './statistics.controller'

import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Statistic } from './statistics.model'
import { JwtModule } from '@nestjs/jwt'
import { CacheModule } from 'src/cache/cache.module'
import { ClientModule } from 'src/clients/client.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Statistic]),
    CacheModule,
    JwtModule,
    ClientModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
