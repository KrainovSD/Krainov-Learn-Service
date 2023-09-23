import { JwtController } from './jwt.controller'
import { JwtService } from './jwt.service'
import { JwtModule as JWT } from '@nestjs/jwt'

import { Module } from '@nestjs/common'

@Module({
  imports: [JWT],
  controllers: [JwtController],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
