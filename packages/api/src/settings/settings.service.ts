import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Settings } from './settings.model'

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings) private readonly settingRepo: typeof Settings,
  ) {}

  async createSettings(userId: number) {
    const settings = await this.settingRepo.create({ userId })
    return settings
  }
}
