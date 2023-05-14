import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { GetUserDto } from './dto/get-user.dto'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { UserInfo } from 'src/auth/auth.service'
import { CallChangePassDto } from './dto/call-change-pass.dto'
import { ChangePassDto } from './dto/change-pass.dto'

@Controller('/api/user')
export class UsersController {
  constructor(private readonly userServise: UsersService) {}

  @Get('/:id')
  getUser(@Param() getUserDto: GetUserDto) {
    return this.userServise.getUserById(getUserDto.id)
  }

  @UseGuards(AuthGuard)
  @Get('')
  getYourself(@Req() request: Request & { user: UserInfo }) {
    return this.userServise.getUserById(request.user.id, true)
  }

  @Post('/pass')
  callChangePass(@Body() dto: CallChangePassDto) {
    return this.userServise.callChangePass(dto.email)
  }
  @Put('/pass')
  changePass(@Body() dto: ChangePassDto) {
    return this.userServise.changePass(dto)
  }
}
