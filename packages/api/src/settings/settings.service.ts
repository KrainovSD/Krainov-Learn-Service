import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Settings } from './settings.model'
import { UpdateSettingsDto } from './dto/update-settings.dto'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { typings, _, utils } from 'src/utils/helpers'

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings) private readonly settingRepo: typeof Settings,
  ) {}

  async updateSettings(dto: UpdateSettingsDto, userId: number) {
    const settings = await this.getSettingsByUserId(userId)
    if (!settings) throw new BadRequestException(ERROR_MESSAGES.userNotFound)

    utils.updateNewValue(settings, dto)
    await settings.save()
    return RESPONSE_MESSAGES.success
  }
  async createSettings(userId: number) {
    const settings = await this.settingRepo.create({ userId })
    return settings
  }

  async getSettingsByUserId(userId: number) {
    return await this.settingRepo.findOne({
      where: {
        userId,
      },
    })
  }
}
