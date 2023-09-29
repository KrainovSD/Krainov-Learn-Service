import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Repeats, RepeatsCreationArgs } from './repeats.model'
import { utils, uuid } from 'src/utils/helpers'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { RepeatDto } from './dto/repeat-dto'
import { Op } from 'sequelize'
import { WordsService } from 'src/words/words.service'

@Injectable()
export class RepeatsService {
  constructor(
    @InjectModel(Repeats) private readonly repeatRepo: typeof Repeats,
    private readonly wordsService: WordsService,
  ) {}

  async createRepeat(repeats: RepeatDto[], userId: string, traceId: string) {
    const words: string[] = repeats.map((repeat) => repeat.word)

    const hasRepeatsIds: string[] = (
      await this.getAllRepeatsByWordAndUserId(words, userId)
    ).map((repeat) => repeat.id)
    if (hasRepeatsIds.length > 0)
      this.deleteRepeat(hasRepeatsIds, userId, traceId)

    const checkedWords = repeats.reduce(
      (result: RepeatsCreationArgs[], repeat) => {
        result.push({
          ...repeat,
          id: uuid(),
          nextRepeat: utils.date.getDate(1, 'days'),
          nextReverseRepeat: utils.date.getDate(1, 'days'),
          isIrregularVerb: utils.common.checkIrregularVerb(repeat.word),
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
  async getAllRepeats(userId: string, traceId: string) {
    return await this.getAllRepeatsByUserId(userId)
  }
  async deleteRepeat(ids: string[], userId: string, traceId: string) {
    const repeats = await this.getAllRepeatsById(ids)

    const checkedIds: string[] = []
    for (const repeat of repeats) {
      if (repeat.userId !== userId) continue
      checkedIds.push(repeat.id)
    }
    await this.repeatRepo.destroy({ where: { id: checkedIds } })

    return RESPONSE_MESSAGES.success
  }
  async studyRepeat(
    id: string,
    userId: string,
    option: string,
    kind: SessionType,
    traceId: string,
  ) {
    const word = await this.getRepeatById(id)
    if (!word || (word && word.userId !== userId))
      throw new BadRequestException(ERROR_MESSAGES.userNotFound)
    const result =
      kind === 'normal' ? word.word === option : word.translate === option

    if (!result) {
      return result
    }

    const settings = await this.wordsService.getUserSettings(userId, traceId)
    if (!settings) throw new BadRequestException(ERROR_MESSAGES.userNotFound)

    word[kind === 'normal' ? 'countRepeat' : 'countReverseRepeat'] =
      word[kind === 'normal' ? 'countRepeat' : 'countReverseRepeat'] + 1
    const countRepeat =
      word[kind === 'normal' ? 'countRepeat' : 'countReverseRepeat']

    /* if done word */
    if (settings.repeatWordsRegularity.length >= countRepeat) {
      const countAnotherRepeat =
        word[kind === 'normal' ? 'countReverseRepeat' : 'countRepeat']
      if (settings.repeatWordsRegularity.length >= countAnotherRepeat) {
        await word.destroy()
        return result
      }
      await word.save()
      return result
    }

    /* if not done */
    const nextRepeat = utils.date.getDate(
      settings.repeatWordsRegularity[countRepeat],
      'days',
    )
    word[kind === 'normal' ? 'nextRepeat' : 'nextReverseRepeat'] = nextRepeat
    await word.save()
    return result
  }

  async getRepeatByUserId(userId: string) {
    return await this.repeatRepo.findAll({ where: { userId } })
  }
  async getRepeatById(id: string) {
    return await this.repeatRepo.findByPk(id)
  }
  async getAllRepeatsByUserId(userId: string) {
    return await this.repeatRepo.findAll({ where: { userId } })
  }
  async getAllRepeatsById(ids: string[]) {
    return await this.repeatRepo.findAll({ where: { id: ids } })
  }
  async getAllRepeatsByWordAndUserId(words: string[], userId: string) {
    return await this.repeatRepo.findAll({ where: { userId, word: words } })
  }
  async getRepeatForNormalSession(
    userId: string,
    traceId: string,
  ): Promise<Pick<Repeats, 'id' | 'word' | 'translate'>[]> {
    return await this.repeatRepo.findAll({
      attributes: ['id', 'translate', 'word'],
      where: {
        userId,
        nextRepeat: {
          [Op.lte]: utils.date.getTomorrow(),
        },
      },
    })
  }
  async getRepeatForReverseSession(
    userId: string,
    traceId: string,
  ): Promise<Pick<Repeats, 'id' | 'word' | 'translate'>[]> {
    return await this.repeatRepo.findAll({
      attributes: ['id', 'translate', 'word'],
      where: {
        userId,
        nextReverseRepeat: {
          [Op.lte]: utils.date.getTomorrow(),
        },
      },
    })
  }
}
