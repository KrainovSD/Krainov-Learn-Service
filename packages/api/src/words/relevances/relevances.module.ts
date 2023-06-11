import { JwtModule } from '@nestjs/jwt'
import { RelevancesController } from './relevances.controller'
import { RelevancesService } from './relevances.service'

import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from 'src/users/users.model'
import { Relevance } from './relevances.model'
import { KnownsModule } from '../knowns/knowns.module'
import { LearnsModule } from '../learns/learns.module'

@Module({
  imports: [
    JwtModule,
    SequelizeModule.forFeature([User, Relevance]),
    KnownsModule,
    LearnsModule,
  ],
  controllers: [RelevancesController],
  providers: [RelevancesService],
  exports: [RelevancesService],
})
export class RelevancesModule {}
