import { JwtModule } from '@nestjs/jwt'
import { RepeatsController } from './repeats.controller'
import { RepeatsService } from './repeats.service'

import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from 'src/users/users.model'
import { Repeats } from './repeats.model'
import { SettingsModule } from 'src/settings/settings.module'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [
    JwtModule,
    SequelizeModule.forFeature([Repeats, User]),
    SettingsModule,
    UsersModule,
  ],
  controllers: [RepeatsController],
  providers: [RepeatsService],
  exports: [RepeatsService],
})
export class RepeatsModule {}
