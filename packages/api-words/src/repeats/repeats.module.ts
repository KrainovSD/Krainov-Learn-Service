import { JwtModule } from '@nestjs/jwt'
import { RepeatsController } from './repeats.controller'
import { RepeatsService } from './repeats.service'

import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Repeats } from './repeats.model'
import { WordsModule } from 'src/words/words.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Repeats]),
    forwardRef(() => WordsModule),
  ],
  controllers: [RepeatsController],
  providers: [RepeatsService],
  exports: [RepeatsService],
})
export class RepeatsModule {}
