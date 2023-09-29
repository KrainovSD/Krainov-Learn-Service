import { Controller } from '@nestjs/common'
import { JwtService } from './jwt.service'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { AuthDto } from './dto/auth.dto'

@Controller()
export class JwtController {
  constructor(private readonly jwtService: JwtService) {}

  @MessagePattern('check_auth')
  checkAuth(@Payload() dto: AuthDto) {
    return this.jwtService.getUserInfo(dto.data.header, dto.traceId)
  }
}
