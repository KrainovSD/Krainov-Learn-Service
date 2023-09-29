import { UsersService } from './users.service'
import { UsersController } from './users.controller'

import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from './users.model'
import { Settings } from 'src/settings/settings.model'
import { SettingsModule } from 'src/settings/settings.module'
import { ClientModule } from 'src/clients/client.module'
import { JwtModule } from 'src/jwt/jwt.module'

@Module({
  imports: [
    SequelizeModule.forFeature([User, Settings]),
    SettingsModule,
    ClientModule,
    JwtModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
