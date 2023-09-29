import { User } from 'src/users/users.model'
import { SettingsController } from './settings.controller'
import { Settings } from './settings.model'
import { SettingsService } from './settings.service'

import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { JwtModule } from 'src/jwt/jwt.module'

@Module({
  imports: [SequelizeModule.forFeature([Settings, User]), JwtModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
