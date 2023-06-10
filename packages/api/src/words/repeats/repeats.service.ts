import { SettingsService } from 'src/settings/settings.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Repeats } from './repeats.model'
import { CreateRepeatDto } from './dto/create-repeat-dto'
import { utils } from 'src/utils/helpers'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'

@Injectable()
export class RepeatsService {
  constructor(
    @InjectModel(Repeats) private readonly repeatRepo: typeof Repeats,
    private readonly settingsService: SettingsService,
  ) {}

  async createRepeat(dto: CreateRepeatDto) {
    const repeat = await this.getRepeatByUserId(dto.userId)
    if (!repeat) throw new BadRequestException(ERROR_MESSAGES.userNotFound)

    const nextRepeat = new Date()
    const nextReverseRepeat = new Date()
    nextRepeat.setDate(nextRepeat.getDate() + 1)
    nextReverseRepeat.setDate(nextReverseRepeat.getDate() + 1)

    const isIrregularVerb = utils.checkIrregularVerb(dto.word)
    const dateCreate = new Date()
    await this.repeatRepo.create({
      ...dto,
      isIrregularVerb,
      dateCreate,
      nextRepeat,
      nextReverseRepeat,
    })
    return RESPONSE_MESSAGES.success
  }

  async getRepeatByUserId(userId: number) {
    const repeat = await this.repeatRepo.findAll({ where: { userId } })
    return repeat
  }
  async getRepeatByWord(word: string) {}
}
