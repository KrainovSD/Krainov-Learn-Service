import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Settings } from './settings.model'
import { UpdateSettingsDto } from './dto/update-settings.dto'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { checkTypes, _ } from 'src/utils/helpers'

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings) private readonly settingRepo: typeof Settings,
  ) {}

  async updateSettings(dto: UpdateSettingsDto, userId: number) {
    const settings = await this.getSettingsByUserId(userId)
    if (!settings) throw new BadRequestException(ERROR_MESSAGES.userNotFound)
    if (!checkTypes.isSimpleObject(settings))
      throw new InternalServerErrorException('')
    for (const settingField in dto) {
      if (_.get(settings, settingField, null)) {
        const newSetting = _.get(dto, settingField, null)
        if (!newSetting) throw new BadRequestException('Неизвестные настройки')
        _.set(settings, settingField, newSetting)
        continue
      }
      throw new BadRequestException('Неизвестные настройки')
    }
    await settings.save()
    return RESPONSE_MESSAGES.success
  }

  async createSettings(userId: number) {
    const settings = await this.settingRepo.create({ userId })
    return settings
  }
  async getSettingsByUserId(userId: number) {
    const settings = await this.settingRepo.findOne({
      where: {
        userId,
      },
    })
    return settings
  }
}
