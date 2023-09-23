import { Controller } from '@nestjs/common'
import { JwtService } from './jwt.service'
import { MessagePattern } from '@nestjs/microservices'

@Controller()
export class JwtController {
  constructor(private readonly jwtService: JwtService) {}

  @MessagePattern('check_auth')
  checkAuth(header: string) {
    return this.jwtService.getUserInfo(header)
  }
}
