import { LearnsService } from './learns.service'
import { LearnsController } from './learns.controller'
import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Learns } from './learns.model'
import { Category } from '../categories/categories.model'
import { JwtModule } from '@nestjs/jwt'
import { CategoriesModule } from '../categories/categories.module'
import { KnownsModule } from '../knowns/knowns.module'
import { RelevancesModule } from '../relevances/relevances.module'
import { SettingsModule } from 'src/settings/settings.module'
import { RepeatsModule } from '../repeats/repeats.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Learns, Category]),
    JwtModule,
    forwardRef(() => CategoriesModule),
    SettingsModule,
    forwardRef(() => RepeatsModule),
    forwardRef(() => KnownsModule),
    forwardRef(() => RelevancesModule),
  ],
  controllers: [LearnsController],
  providers: [LearnsService],
  exports: [LearnsService],
})
export class LearnsModule {}
