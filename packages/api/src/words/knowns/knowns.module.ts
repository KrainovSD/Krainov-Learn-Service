import { JwtModule } from '@nestjs/jwt'
import { KnownsController } from './knowns.controller'
import { KnownsService } from './knowns.service'

import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Knowns } from './knowns.model'
import { User } from 'src/users/users.model'

@Module({
  imports: [JwtModule, SequelizeModule.forFeature([Knowns, User])],
  controllers: [KnownsController],
  providers: [KnownsService],
  exports: [KnownsService],
})
export class KnownsModule {}
