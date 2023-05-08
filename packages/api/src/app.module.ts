import { AppController } from './app.controller'
import { Module } from '@nestjs/common'

@Module({
  controllers: [AppController],
  imports: [],
})
export class AppModule {}
