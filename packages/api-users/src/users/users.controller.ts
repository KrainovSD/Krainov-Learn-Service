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
import {
  MAX_SIZE_AVATAR,
  MAX_SIZE_WALLPAPER,
  MIME_TYPE_AVATAR,
  MIME_TYPE_WALLPAPER,
  UPLOAD_PATH_AVATAR,
  UPLOAD_PATH_WALLPAPER,
} from './users.constants'
import { TraceId, UploadInterceptor, UserId } from '../utils'
import { DeleteUsersDto } from './dto/delete-users.dto'

@ApiTags('Пользователи')
@Controller(`${API_VERSION.v1}/user`)
export class UsersController {
  constructor(private readonly userServise: UsersService) {}

  @Get('/:id')
  getUser(@Param() getUserDto: GetUserDto, @TraceId() traceId: string) {
    return this.userServise.getUserById(getUserDto.id, traceId)
  }

  @UseGuards(AuthGuard())
  @Get('')
  getYourself(@UserId() userId: string, @TraceId() traceId: string) {
    return this.userServise.getUserById(userId, traceId, true)
  }

  @UseGuards(AuthGuard())
  @Get('/all')
  getAllUser(@UserId() userId: string, @TraceId() traceId: string) {
    return this.userServise.getAllUser(userId, traceId)
  }

  @Post('/pass')
  callChangePass(
    @Body() dto: CallChangePassDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.userServise.callChangePass(dto.email, userId, traceId)
  }
  @Put('/pass')
  changePass(
    @Body() dto: ChangePassDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.userServise.changePass(dto, userId, traceId)
  }

  @UseGuards(AuthGuard())
  @Post('/email')
  callChangeEmail(@UserId() userId: string, @TraceId() traceId: string) {
    return this.userServise.callChangeEmail(userId, traceId)
  }

  @UseGuards(AuthGuard())
  @Put('/email')
  changeEmail(
    @Body() dto: ChangeEmailDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.userServise.changeEmail(dto, userId, traceId)
  }

  @UseGuards(AuthGuard({ subscription: true }))
  @Put('/nickName')
  changeNickName(
    @Body() dto: ChangeNickNameDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.userServise.changeNickName(dto.nickName, userId, traceId)
  }

  @UseGuards(AuthGuard())
  @Delete('/avatar')
  clearAvatar(@UserId() userId: string, @TraceId() traceId: string) {
    return this.userServise.clearAvatar(userId, traceId)
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
    UploadInterceptor({
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
      request.traceId,
    )
  }

  @UseGuards(AuthGuard())
  @Delete('/wallpaper')
  clearWallpaper(@UserId() userId: string, @TraceId() traceId: string) {
    return this.userServise.clearWallpaper(userId, traceId)
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
    UploadInterceptor({
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
      request.traceId,
    )
  }

  @UseGuards(AuthGuard({ roles: 'admin' }))
  @Post('/delete')
  deleteUsers(@Body() dto: DeleteUsersDto, @TraceId() traceId: string) {
    return this.userServise.deleteUsers(dto, traceId)
  }
}
