import { SequelizeModule } from '@nestjs/sequelize'
import { SessionsService } from './sessions.service'
import { Module } from '@nestjs/common'
import { Sessions } from './sessions.model'

@Module({
  imports: [SequelizeModule.forFeature([Sessions])],
  controllers: [],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
