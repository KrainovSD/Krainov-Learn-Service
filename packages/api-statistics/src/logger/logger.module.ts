import { LoggerService } from './logger.service'

import { Module } from '@nestjs/common'

@Module({
  imports: [],
  controllers: [],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
