import { SettingsService } from 'src/settings/settings.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Repeats, RepeatsCreationArgs } from './repeats.model'
import { CreateRepeatDto } from './dto/create-repeat-dto'
import { utils } from 'src/utils/helpers'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { UsersService } from 'src/users/users.service'
import { RepeatDto } from './dto/repeat-dto'

@Injectable()
export class RepeatsService {
  constructor(
    @InjectModel(Repeats) private readonly repeatRepo: typeof Repeats,
    private readonly settingsService: SettingsService,
    private readonly userService: UsersService,
  ) {}

  async createRepeat(repeats: RepeatDto[], userId: number) {
    const user = await this.userService.getUserById(userId)
    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound)

    const words: string[] = repeats.map((repeat) => repeat.word)

    const hasRepeatsIds: number[] = (
      await this.getAllRepeatsByWordAndUserId(words, userId)
    ).map((repeat) => repeat.id)
    if (hasRepeatsIds.length > 0) this.deleteRepeat(hasRepeatsIds, userId)

    const checkedWords = repeats.reduce(
      (result: RepeatsCreationArgs[], repeat) => {
        result.push({
          ...repeat,
          nextRepeat: utils.date.getDate(1, 'days'),
          nextReverseRepeat: utils.date.getDate(1, 'days'),
          isIrregularVerb: utils.checkIrregularVerb(repeat.word),
          dateCreate: new Date(),
          userId,
        })
        return result
      },
      [],
    )

    await this.repeatRepo.bulkCreate(checkedWords)
    return RESPONSE_MESSAGES.success
  }
  async getAllRepeats(userId: number) {
    return await this.getAllRepeatsByUserId(userId)
  }
  async deleteRepeat(ids: number[], userId: number) {
    const repeats = await this.getAllRepeatsById(ids)

    const checkedIds: number[] = []
    for (const repeat of repeats) {
      if (repeat.userId !== userId) continue
      checkedIds.push(repeat.id)
    }
    await this.repeatRepo.destroy({ where: { id: checkedIds } })

    return RESPONSE_MESSAGES.success
  }
  async studyRepeat() {}

  async getRepeatByUserId(userId: number) {
    return await this.repeatRepo.findAll({ where: { userId } })
  }
  async getRepeatById(id: number) {
    return await this.repeatRepo.findByPk(id)
  }
  async getAllRepeatsByUserId(userId: number) {
    return await this.repeatRepo.findAll({ where: { userId } })
  }
  async getAllRepeatsById(ids: number[]) {
    return await this.repeatRepo.findAll({ where: { id: ids } })
  }
  async getAllRepeatsByWordAndUserId(words: string[], userId: number) {
    return await this.repeatRepo.findAll({ where: { userId, word: words } })
  }
}
