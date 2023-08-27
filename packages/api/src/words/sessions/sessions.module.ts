import { SequelizeModule } from '@nestjs/sequelize'
import { SessionsService } from './sessions.service'
import { Module } from '@nestjs/common'
import { User } from 'src/users/users.model'
import { Sessions } from './sessions.model'

@Module({
  imports: [SequelizeModule.forFeature([Sessions, User])],
  controllers: [],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
