import { SettingsService } from 'src/settings/settings.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Repeats } from './repeats.model'
import { CreateRepeatDto } from './dto/create-repeat-dto'
import { checkIrregularVerb } from 'src/utils/helpers'
import { ERROR_MESSAGES } from 'src/const'

@Injectable()
export class RepeatsService {
  constructor(
    @InjectModel(Repeats) private readonly repeatRepo: typeof Repeats,
    private readonly settingsService: SettingsService,
  ) {}

  async createRepeat(dto: CreateRepeatDto) {
    // const isIrregularVerb = checkIrregularVerb(dto.word)
    // const dateCreate = new Date()
    // const repeat = await this.repeatRepo.create({...dto, isIrregularVerb, dateCreate})
    // return repeat
  }
}
