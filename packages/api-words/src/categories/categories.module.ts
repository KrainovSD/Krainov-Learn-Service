import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Category } from './categories.model'
import { CategoriesController } from './categories.controller'
import { CategoriesService } from './categories.service'
import { WordsModule } from 'src/words/words.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Category]),
    forwardRef(() => WordsModule),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
