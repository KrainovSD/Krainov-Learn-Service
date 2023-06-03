import {
  Controller,
  Post,
  Body,
  Res,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthService, UserInfo } from './auth.service'
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { ConfirmDto } from './dto/confirm.dto'
import { ApiTags } from '@nestjs/swagger'
import { LoginDto } from './dto/login.dto'
import { Request, Response } from 'express'
import { API_VERSION, EXPIRES_COOKIES, RESPONSE_MESSAGES } from 'src/const'
import { AuthGuard } from 'src/utils/guards/auth.guard'

type CookieOptions = {
  sameSite: 'strict'
  secure: boolean
  httpOnly: boolean
  maxAge: number
}

@ApiTags('Авторизация')
@Controller(`${API_VERSION.v1}/auth`)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getCookieOptions(type: 'create' | 'delete'): CookieOptions {
    return {
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
      maxAge: type === 'create' ? EXPIRES_COOKIES : 0,
    }
  }

  @Post('/register')
  register(@Body() userDto: CreateUserDto) {
    return this.authService.register(userDto)
  }

  @Post('/confirm')
  confirm(@Body() confirmDto: ConfirmDto) {
    return this.authService.confirm(confirmDto)
  }

  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.login(loginDto)
    response.cookie('token', tokens.refresh, this.getCookieOptions('create'))
    return { token: tokens.access }
  }

  @Put('/token')
  token(@Req() request: Request) {
    return this.authService.token(request.cookies['token'])
  }

  @UseGuards(AuthGuard)
  @Put('/logout')
  async logout(
    @Req() request: Request & { user: UserInfo },
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(request.cookies['token'], request.user)
    response.clearCookie('token', this.getCookieOptions('delete'))
    return RESPONSE_MESSAGES.success
  }
}
