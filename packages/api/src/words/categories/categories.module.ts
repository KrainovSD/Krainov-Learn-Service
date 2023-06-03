import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from 'src/users/users.model'
import { Category } from './categories.model'
import { CategoriesController } from './categories.controller'
import { CategoriesService } from './categories.service'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [SequelizeModule.forFeature([Category, User]), JwtModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
