import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { GetUserDto } from './dto/get-user.dto'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { TRequest } from 'src/auth/auth.service'
import { CallChangePassDto } from './dto/call-change-pass.dto'
import { ChangePassDto } from './dto/change-pass.dto'
import { ChangeEmailDto } from './dto/change-email.dto'
import { ChangeNickNameDto } from './dto/change-nick-name.dto'
import { SubscribeGuard } from 'src/utils/guards/subscription.guard'
import { FileInterceptor } from '@nestjs/platform-express'
import { multerOptions } from 'src/multer.config'

@Controller('/api/user')
export class UsersController {
  constructor(private readonly userServise: UsersService) {}

  @Get('/:id')
  getUser(@Param() getUserDto: GetUserDto) {
    return this.userServise.getUserById(getUserDto.id)
  }

  @UseGuards(AuthGuard)
  @Get('')
  getYourself(@Req() request: TRequest) {
    return this.userServise.getUserById(request.user.id, true)
  }

  @UseGuards(AuthGuard)
  @Get('/all')
  getAllUser(@Req() request: TRequest) {
    return this.userServise.getAllUser(request.user.id)
  }

  @Post('/pass')
  callChangePass(@Body() dto: CallChangePassDto) {
    return this.userServise.callChangePass(dto.email)
  }
  @Put('/pass')
  changePass(@Body() dto: ChangePassDto) {
    return this.userServise.changePass(dto)
  }

  @UseGuards(AuthGuard)
  @Post('/email')
  callChangeEmail(@Req() request: TRequest) {
    return this.userServise.callChangeEmail(request.user.id)
  }

  @UseGuards(AuthGuard)
  @Put('/email')
  changeEmail(@Body() dto: ChangeEmailDto, @Req() request: TRequest) {
    return this.userServise.changeEmail(dto, request.user.id)
  }

  @UseGuards(SubscribeGuard)
  @Put('/nickName')
  changeNickName(@Body() dto: ChangeNickNameDto, @Req() request: TRequest) {
    return this.userServise.changeNickName(dto.nickName, request.user.id)
  }

  @UseGuards(AuthGuard)
  @Post('/avatar')
  clearAvatar(@Req() request: TRequest) {
    return this.userServise.clearAvatar(request.user.id)
  }

  @UseGuards(AuthGuard)
  @Put('/avatar')
  @UseInterceptors(FileInterceptor('avatar', multerOptions))
  updateAvatar(
    @UploadedFile()
    file: Express.Multer.File,
    @Req() request: TRequest,
  ) {
    return this.userServise.updateAvatar(file, request.user.id)
  }

  @UseGuards(AuthGuard)
  @Post('/wallpaper')
  clearWallpaper(@Req() request: TRequest) {
    return this.userServise.clearWallpaper(request.user.id)
  }

  @UseGuards(AuthGuard)
  @Put('/wallpaper')
  @UseInterceptors(FileInterceptor('avatar', multerOptions))
  updateWallpaper(
    @UploadedFile()
    file: Express.Multer.File,
    @Req() request: TRequest,
  ) {
    return this.userServise.updateWallpaper(file, request.user.id)
  }
}
