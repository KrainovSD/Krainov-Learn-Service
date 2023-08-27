import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from 'src/users/users.model'
import { Category } from './categories.model'
import { CategoriesController } from './categories.controller'
import { CategoriesService } from './categories.service'
import { JwtModule } from '@nestjs/jwt'
import { KnownsModule } from '../knowns/knowns.module'
import { LearnsModule } from '../learns/learns.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Category, User]),
    JwtModule,
    forwardRef(() => KnownsModule),
    forwardRef(() => LearnsModule),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
