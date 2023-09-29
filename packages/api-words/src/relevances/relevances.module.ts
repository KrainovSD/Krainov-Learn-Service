import { RelevancesController } from './relevances.controller'
import { RelevancesService } from './relevances.service'
import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Relevance } from './relevances.model'
import { WordsModule } from 'src/words/words.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Relevance]),
    forwardRef(() => WordsModule),
  ],
  controllers: [RelevancesController],
  providers: [RelevancesService],
  exports: [RelevancesService],
})
export class RelevancesModule {}
