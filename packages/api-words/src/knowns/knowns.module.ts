import { JwtModule } from '@nestjs/jwt'
import { KnownsController } from './knowns.controller'
import { KnownsService } from './knowns.service'

import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Knowns } from './knowns.model'
import { WordsModule } from '../words/words.module'

@Module({
  imports: [
    JwtModule,
    SequelizeModule.forFeature([Knowns]),
    forwardRef(() => WordsModule),
  ],
  controllers: [KnownsController],
  providers: [KnownsService],
  exports: [KnownsService],
})
export class KnownsModule {}
