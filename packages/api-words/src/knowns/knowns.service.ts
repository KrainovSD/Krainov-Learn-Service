import { InjectModel } from '@nestjs/sequelize'
import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common'
import { Knowns, KnownsCreationArgs } from './knowns.model'
import { utils, uuid } from 'src/utils/helpers'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { UpdateKnownsDto } from './dto/update-knowns-dto'
import { KnownsDto } from './dto/knowns-dto'
import { FullKnownsDto } from './dto/full-known-dto'
import { Op } from 'sequelize'
import { WordsService } from 'src/words/words.service'

@Injectable()
export class KnownsService {
  constructor(
    @InjectModel(Knowns) private readonly knownRepo: typeof Knowns,
    @Inject(forwardRef(() => WordsService))
    private readonly wordsService: WordsService,
  ) {}

  async createKnown(knowns: KnownsDto[], userId: string, traceId: string) {
    const words: string[] = knowns.map((known) => known.word)
    const { similarKnowns, similarLearns, similarRelevances } =
      await this.wordsService.getAllSimilarWords(words, userId, traceId)
    const hasWords = new Set([
      ...similarKnowns,
      ...similarLearns,
      ...similarRelevances,
    ])

    const checkedWords = knowns.reduce(
      (result: KnownsCreationArgs[], known) => {
        if (hasWords.has(known.word)) return result

        result.push({
          ...known,
          id: uuid(),
          isIrregularVerb: utils.common.checkIrregularVerb(known.word),
          dateCreate: new Date(),
          userId,
        })
        return result
      },
      [],
    )

    await this.knownRepo.bulkCreate(checkedWords)
    return hasWords.size === 0
      ? RESPONSE_MESSAGES.success
      : RESPONSE_MESSAGES.existWords(hasWords)
  }
  async deleteKnown(ids: string[], userId: string, traceId: string) {
    const knowns = await this.getAllKnownsById(ids)

    const checkedIds: string[] = []
    for (const known of knowns) {
      if (known.userId !== userId) continue
      checkedIds.push(known.id)
    }

    await this.knownRepo.destroy({ where: { id: checkedIds } })

    return RESPONSE_MESSAGES.success
  }
  async deleteKnownsByUserIds(userIds: string[], traceId: string) {
    await this.knownRepo.destroy({ where: { userId: userIds } })
  }

  async updateKnown(dto: FullKnownsDto, userId: string, traceId: string) {
    const known = await this.getKnownById(dto.id)
    if (!known || (known && known.userId !== userId))
      throw new BadRequestException(ERROR_MESSAGES.infoNotFound)

    await this.wordsService.checkHasWord({
      currentWord: dto.word,
      traceId,
      userId,
      id: dto.id,
      type: 'known',
    })

    known.isIrregularVerb = utils.common.checkIrregularVerb(dto.word)
    utils.common.updateNewValue(known, dto, ['id'])
    await known.save()
    return RESPONSE_MESSAGES.success
  }
  async updateKnowns(dto: UpdateKnownsDto, userId: string, traceId: string) {
    const wordList: string[] = []
    const idList: string[] = []
    for (const word of dto.words) {
      wordList.push(word.word)
      idList.push(word.id)
    }

    const similarWords = await this.wordsService.getAllSimilarWordsWithId(
      wordList,
      userId,
      traceId,
    )
    const notBelongToUser = new Set<string>()
    ;(await this.getAllKnownsByIdAndNotUserId(idList, userId)).forEach((word) =>
      notBelongToUser.add(word.id),
    )

    const checkedWords: KnownsCreationArgs[] = dto.words.reduce(
      (result: KnownsCreationArgs[], word) => {
        const hasWordId = similarWords.get(word.word)
        if (
          (hasWordId && hasWordId !== word.id) ||
          notBelongToUser.has(word.id)
        )
          return result
        result.push({
          ...word,
          userId,
          isIrregularVerb: utils.common.checkIrregularVerb(word.word),
          dateCreate: new Date(),
        })
        return result
      },

      [],
    )

    await this.knownRepo.bulkCreate(checkedWords, {
      updateOnDuplicate: ['id'],
    })

    return RESPONSE_MESSAGES.success
  }
  async getAllKnowns(userId: string, traceId: string) {
    return await this.getAllKnownsByUserId(userId)
  }
  async studyKnown(
    id: string,
    userId: string,
    option: string,
    kind: SessionType,
    traceId: string,
  ) {
    const word = await this.getKnownById(id)
    if (!word || (word && word.userId !== userId))
      throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    const result =
      kind === 'normal' ? word.word === option : word.translate === option

    if (!result) {
      const settings = await this.wordsService.getUserSettings(userId, traceId)
      if (!settings)
        throw new BadRequestException(ERROR_MESSAGES.settingsNotFound)
      const countMistakes = settings.mistakesInWordsCount
      word.mistakes++
      word.mistakesTotal++
      if (word.mistakes === countMistakes) {
        await this.wordsService.registerWordWithMistakes(
          {
            word: word.word,
            transcription: word.transcription,
            translate: word.translate,
            description: word.description,
            example: word.example,
          },
          userId,
          traceId,
        )
        word.mistakes = 0
      }
      await word.save()
      return result
    }

    word[kind === 'normal' ? 'lastRepeat' : 'lastReverseRepeat'] = new Date()
    await word.save()
    return result
  }

  async getKnownById(id: string) {
    return await this.knownRepo.findByPk(id)
  }
  async getKnownByWordAndUserId(word: string, userId: string) {
    return await this.knownRepo.findOne({ where: { userId, word } })
  }
  async getAllKnownsById(ids: string[]) {
    return await this.knownRepo.findAll({ where: { id: ids } })
  }
  async getAllKnownsByUserId(userId: string) {
    return await this.knownRepo.findAll({ where: { userId } })
  }
  async getAllKnownsByWordAndUserId(words: string | string[], userId: string) {
    return await this.knownRepo.findAll({ where: { userId, word: words } })
  }
  async getAllKnownsByIdAndNotUserId(
    ids: string[],
    userId: string,
  ): Promise<Pick<Knowns, 'id'>[]> {
    return await this.knownRepo.findAll({
      attributes: ['id'],
      where: {
        id: ids,
        userId: {
          [Op.not]: userId,
        },
      },
    })
  }

  async getKnownForNormalSession(
    userId: string,
    traceId: string,
  ): Promise<Pick<Knowns, 'id' | 'word' | 'translate'>[]> {
    const settings = await this.wordsService.getUserSettings(userId, traceId)
    if (!settings)
      throw new BadRequestException(ERROR_MESSAGES.settingsNotFound)

    return await this.knownRepo.findAll({
      attributes: ['id', 'translate', 'word'],
      where: {
        userId,
      },
      order: [['lastRepeat', 'ASC NULLS FIRST']],
      limit: settings.knownWordsCount,
    })
  }
  async getKnownForReverseSession(
    userId: string,
    traceId: string,
  ): Promise<Pick<Knowns, 'id' | 'word' | 'translate'>[]> {
    const settings = await this.wordsService.getUserSettings(userId, traceId)
    if (!settings)
      throw new BadRequestException(ERROR_MESSAGES.settingsNotFound)

    return await this.knownRepo.findAll({
      attributes: ['id', 'translate', 'word'],
      where: {
        userId,
      },
      order: [['lastReverseRepeat', 'ASC NULLS FIRST']],
      limit: settings.knownWordsCount,
    })
  }
}
