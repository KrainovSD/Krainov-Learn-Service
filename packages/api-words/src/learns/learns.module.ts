import { LearnsService } from './learns.service'
import { LearnsController } from './learns.controller'
import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Learns } from './learns.model'
import { Category } from '../categories/categories.model'
import { WordsModule } from '../words/words.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Learns, Category]),
    forwardRef(() => WordsModule),
  ],
  controllers: [LearnsController],
  providers: [LearnsService],
  exports: [LearnsService],
})
export class LearnsModule {}
