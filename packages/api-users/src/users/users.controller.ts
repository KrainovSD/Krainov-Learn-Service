import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
  Delete,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { GetUserDto } from './dto/get-user.dto'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { TRequest } from 'src/auth/auth.service'
import { CallChangePassDto } from './dto/call-change-pass.dto'
import { ChangePassDto } from './dto/change-pass.dto'
import { ChangeEmailDto } from './dto/change-email.dto'
import { ChangeNickNameDto } from './dto/change-nick-name.dto'
import { API_VERSION } from 'src/const'
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { nestUtils } from '../utils/helpers'
import {
  MAX_SIZE_AVATAR,
  MAX_SIZE_WALLPAPER,
  MIME_TYPE_AVATAR,
  MIME_TYPE_WALLPAPER,
  UPLOAD_PATH_AVATAR,
  UPLOAD_PATH_WALLPAPER,
} from './users.constants'

@ApiTags('Пользователи')
@Controller(`${API_VERSION.v1}/user`)
export class UsersController {
  constructor(private readonly userServise: UsersService) {}

  @Get('/:id')
  getUser(@Param() getUserDto: GetUserDto) {
    return this.userServise.getUserById(getUserDto.id)
  }

  @UseGuards(AuthGuard())
  @Get('')
  getYourself(@Req() request: TRequest) {
    return this.userServise.getUserById(request.user.id, true)
  }

  @UseGuards(AuthGuard())
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

  @UseGuards(AuthGuard())
  @Post('/email')
  callChangeEmail(@Req() request: TRequest) {
    return this.userServise.callChangeEmail(request.user.id)
  }

  @UseGuards(AuthGuard())
  @Put('/email')
  changeEmail(@Body() dto: ChangeEmailDto, @Req() request: TRequest) {
    return this.userServise.changeEmail(dto, request.user.id)
  }

  @UseGuards(AuthGuard({ subscription: true }))
  @Put('/nickName')
  changeNickName(@Body() dto: ChangeNickNameDto, @Req() request: TRequest) {
    return this.userServise.changeNickName(dto.nickName, request.user.id)
  }

  @UseGuards(AuthGuard())
  @Delete('/avatar')
  clearAvatar(@Req() request: TRequest) {
    return this.userServise.clearAvatar(request.user.id)
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(AuthGuard())
  @UseInterceptors(
    nestUtils.interceptors.UploadInterceptor({
      fieldName: 'avatar',
      limits: MAX_SIZE_AVATAR,
      mimeTypes: MIME_TYPE_AVATAR,
      pathToSave: UPLOAD_PATH_AVATAR,
    }),
  )
  @Put('/avatar')
  updateAvatar(@Req() request: TRequest) {
    return this.userServise.updateAvatar(
      request.incomingFileName,
      request.user.id,
    )
  }

  @UseGuards(AuthGuard())
  @Delete('/wallpaper')
  clearWallpaper(@Req() request: TRequest) {
    return this.userServise.clearWallpaper(request.user.id)
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        wallpaper: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(AuthGuard())
  @Put('/wallpaper')
  @UseInterceptors(
    nestUtils.interceptors.UploadInterceptor({
      fieldName: 'wallpaper',
      limits: MAX_SIZE_WALLPAPER,
      mimeTypes: MIME_TYPE_WALLPAPER,
      pathToSave: UPLOAD_PATH_WALLPAPER,
    }),
  )
  updateWallpaper(@Req() request: TRequest) {
    return this.userServise.updateWallpaper(
      request.incomingFileName,
      request.user.id,
    )
  }
}
