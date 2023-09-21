import { UsersService } from './users.service'
import { UsersController } from './users.controller'

import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from './users.model'
import { Settings } from 'src/settings/settings.model'
import { SettingsModule } from 'src/settings/settings.module'
import { AuthModule } from 'src/auth/auth.module'
import { JwtModule } from '@nestjs/jwt'
import { ClientModule } from 'src/clients/client.module'

@Module({
  imports: [
    SequelizeModule.forFeature([User, Settings]),
    SettingsModule,
    forwardRef(() => AuthModule),
    JwtModule,
    ClientModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
