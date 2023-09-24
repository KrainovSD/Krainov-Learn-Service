import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Settings } from './settings.model'
import { UpdateSettingsDto } from './dto/update-settings.dto'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { _, utils, uuid } from 'src/utils/helpers'

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings) private readonly settingRepo: typeof Settings,
  ) {}

  async updateSettings(
    dto: UpdateSettingsDto,
    userId: string,
    traceId: string,
  ) {
    const settings = await this.getSettingsByUserId(userId, traceId)
    if (!settings) throw new BadRequestException(ERROR_MESSAGES.userNotFound)

    utils.common.updateNewValue(settings, dto)
    await settings.save()
    return RESPONSE_MESSAGES.success
  }

  async createSettings(userId: string) {
    const settings = await this.settingRepo.create({
      id: uuid(),
      userId,
    })
    return settings
  }

  async getSettingsByUserId(userId: string, traceId: string) {
    return await this.settingRepo.findOne({
      where: {
        userId,
      },
    })
  }
}
