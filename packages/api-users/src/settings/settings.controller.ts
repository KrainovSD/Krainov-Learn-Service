import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common'
import { UpdateSettingsDto } from './dto/update-settings.dto'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { SettingsService } from './settings.service'
import { API_VERSION } from 'src/const'
import { ApiTags } from '@nestjs/swagger'
import { TraceId, UserId } from '../utils'

@ApiTags('Настройки')
@Controller(`${API_VERSION.v1}/settings`)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(AuthGuard())
  @Put('')
  updateSetting(
    @Body() dto: UpdateSettingsDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.settingsService.updateSettings(dto, userId, traceId)
  }

  @UseGuards(AuthGuard())
  @Get('')
  get(@UserId() userId: string, @TraceId() traceId: string) {
    return this.settingsService.getSettingsByUserId(userId, traceId)
  }
}
