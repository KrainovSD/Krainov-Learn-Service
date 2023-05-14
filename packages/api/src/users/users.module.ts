import { UsersService } from './users.service'
import { UsersController } from './users.controller'

import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from './users.model'
import { Statistic } from 'src/statistics/statistics.model'
import { StatisticsModule } from 'src/statistics/statistics.module'

@Module({
  imports: [SequelizeModule.forFeature([User, Statistic]), StatisticsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
