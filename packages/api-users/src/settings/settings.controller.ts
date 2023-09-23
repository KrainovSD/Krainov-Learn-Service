import { Body, Controller, Put, Req, UseGuards } from '@nestjs/common'
import { UpdateSettingsDto } from './dto/update-settings.dto'
import { UserInfo } from 'src/auth/auth.service'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { SettingsService } from './settings.service'
import { API_VERSION } from 'src/const'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Настройки')
@Controller(`${API_VERSION.v1}/settings`)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(AuthGuard())
  @Put('')
  updateSetting(
    @Body() dto: UpdateSettingsDto,
    @Req() request: Request & { user: UserInfo },
  ) {
    return this.settingsService.updateSettings(dto, request.user.id)
  }
}
