import { LearnsService } from './learns.service'
import { LearnsController } from './learns.controller'

import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Learns } from './learns.model'
import { User } from 'src/users/users.model'
import { Category } from '../categories/categories.model'
import { JwtModule } from '@nestjs/jwt'
import { CategoriesModule } from '../categories/categories.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Learns, User, Category]),
    JwtModule,
    CategoriesModule,
  ],
  controllers: [LearnsController],
  providers: [LearnsService],
  exports: [LearnsService],
})
export class LearnsModule {}
