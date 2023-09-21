import { JwtModule } from '@nestjs/jwt'
import { RepeatsController } from './repeats.controller'
import { RepeatsService } from './repeats.service'

import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Repeats } from './repeats.model'

@Module({
  imports: [JwtModule, SequelizeModule.forFeature([Repeats])],
  controllers: [RepeatsController],
  providers: [RepeatsService],
  exports: [RepeatsService],
})
export class RepeatsModule {}
