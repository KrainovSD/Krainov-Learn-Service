import { UsersService } from './users.service'
import { UsersController } from './users.controller'

import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from './users.model'
import { Statistic } from 'src/statistics/statistics.model'
import { StatisticsModule } from 'src/statistics/statistics.module'
import { Settings } from 'src/settings/settings.model'
import { SettingsModule } from 'src/settings/settings.module'
import { AuthModule } from 'src/auth/auth.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [
    SequelizeModule.forFeature([User, Statistic, Settings]),
    StatisticsModule,
    SettingsModule,
    forwardRef(() => AuthModule),
    JwtModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
