import { JwtModule } from '@nestjs/jwt'
import { KnownsController } from './knowns.controller'
import { KnownsService } from './knowns.service'

import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Knowns } from './knowns.model'
import { User } from 'src/users/users.model'
import { RelevancesModule } from '../relevances/relevances.module'
import { LearnsModule } from '../learns/learns.module'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [
    JwtModule,
    SequelizeModule.forFeature([Knowns, User]),
    forwardRef(() => LearnsModule),
    forwardRef(() => RelevancesModule),
    UsersModule,
  ],
  controllers: [KnownsController],
  providers: [KnownsService],
  exports: [KnownsService],
})
export class KnownsModule {}
