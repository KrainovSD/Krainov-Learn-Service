import { SettingsService } from 'src/settings/settings.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Repeats } from './repeats.model'
import { CreateRepeatDto } from './dto/create-repeat-dto'
import { utils } from 'src/utils/helpers'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class RepeatsService {
  constructor(
    @InjectModel(Repeats) private readonly repeatRepo: typeof Repeats,
    private readonly settingsService: SettingsService,
    private readonly userService: UsersService,
  ) {}

  async createRepeat(dto: CreateRepeatDto) {
    const user = await this.userService.getUserById(dto.userId)
    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound)
    const repeat = await this.getRepeatByWordAndUserId(dto.word, dto.userId)
    if (repeat) this.deleteRepeat([repeat.id], dto.userId)

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
  async getAllRepeat(userId: number) {
    return await this.getAllRepeatByUserId(userId)
  }
  async deleteRepeat(ids: number[], userId: number) {
    for (const id of ids) {
      const repeat = await this.getRepeatById(id)
      if (!repeat || (repeat && repeat.userId !== userId))
        throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    }
    await this.repeatRepo.destroy({ where: { id: ids } })

    return RESPONSE_MESSAGES.success
  }

  async getRepeatByUserId(userId: number) {
    const repeat = await this.repeatRepo.findAll({ where: { userId } })
    return repeat
  }
  async getRepeatById(id: number) {
    return await this.repeatRepo.findByPk(id)
  }
  async getRepeatByWordAndUserId(word: string, userId: number) {
    const repeat = await this.repeatRepo.findOne({ where: { userId, word } })
    return repeat
  }
  async getAllRepeatByUserId(userId: number) {
    const repeat = await this.repeatRepo.findAll({ where: { userId } })
    return repeat
  }
}
