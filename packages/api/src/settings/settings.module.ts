import { User } from 'src/users/users.model'
import { SettingsController } from './settings.controller'
import { Settings } from './settings.model'
import { SettingsService } from './settings.service'

import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [SequelizeModule.forFeature([Settings, User]), AuthModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
