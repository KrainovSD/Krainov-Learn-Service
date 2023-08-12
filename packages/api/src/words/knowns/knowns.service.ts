import { InjectModel } from '@nestjs/sequelize'
import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common'
import { Knowns, KnownsCreationArgs } from './knowns.model'
import { node, utils } from 'src/utils/helpers'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { UpdateKnownsDto } from './dto/update-knowns-dto'
import { LearnsService } from '../learns/learns.service'
import { RelevancesService } from '../relevances/relevances.service'
import { KnownsDto } from './dto/knowns-dto'
import { UsersService } from 'src/users/users.service'
import { FullKnownsDto } from './dto/full-known-dto'
import { Op } from 'sequelize'

@Injectable()
export class KnownsService {
  constructor(
    @InjectModel(Knowns) private readonly knownRepo: typeof Knowns,
    @Inject(forwardRef(() => LearnsService))
    private readonly learnService: LearnsService,
    @Inject(forwardRef(() => RelevancesService))
    private readonly relevanceService: RelevancesService,
    private readonly userService: UsersService,
  ) {}

  async createKnown(knowns: KnownsDto[], userId: string) {
    const user = await this.userService.getUserById(userId)
    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound)

    const words: string[] = knowns.map((known) => known.word)
    const hasWords = await this.getHasWords(words, userId)

    const checkedWords = knowns.reduce(
      (result: KnownsCreationArgs[], known) => {
        if (hasWords.has(known.word)) return result

        result.push({
          ...known,
          id: node.genUUID(),
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
  async deleteKnown(ids: string[], userId: string) {
    const knowns = await this.getAllKnownsById(ids)

    const checkedIds: string[] = []
    for (const known of knowns) {
      if (known.userId !== userId) continue
      checkedIds.push(known.id)
    }

    await this.knownRepo.destroy({ where: { id: checkedIds } })

    return RESPONSE_MESSAGES.success
  }
  async updateKnown(dto: FullKnownsDto, userId: string) {
    const known = await this.getKnownById(dto.id)
    if (!known || (known && known.userId !== userId))
      throw new BadRequestException(ERROR_MESSAGES.infoNotFound)

    await this.checkHasWord(dto.word, dto.id, userId)

    known.isIrregularVerb = utils.common.checkIrregularVerb(dto.word)
    utils.common.updateNewValue(known, dto, ['id'])
    await known.save()
    return RESPONSE_MESSAGES.success
  }
  async updateKnowns(dto: UpdateKnownsDto, userId: string) {
    const wordList: string[] = []
    const idList: string[] = []
    for (const word of dto.words) {
      wordList.push(word.word)
      idList.push(word.id)
    }

    const hasWords = await this.getHasWordsWithId(wordList, userId)
    const notBelongToUser = new Set<string>()
    ;(await this.getAllKnownsByIdAndNotUserId(idList, userId)).forEach(
      (word: Knowns) => notBelongToUser.add(word.id),
    )

    const checkedWords: KnownsCreationArgs[] = dto.words.reduce(
      (result: KnownsCreationArgs[], word) => {
        const hasWordId = hasWords.get(word.word)
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
  }
  async getAllKnowns(userId: string) {
    return await this.getAllKnownsByUserId(userId)
  }
  async studyKnown() {}

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
  async getAllKnownsByIdAndNotUserId(ids: string[], userId: string) {
    return await this.knownRepo.findAll({
      where: {
        id: ids,
        userId: {
          [Op.not]: userId,
        },
      },
    })
  }

  private async getHasWords(words: string | string[], userId: string) {
    const hasWords = new Set<string>()

    const knownWords = (
      await this.getAllKnownsByWordAndUserId(words, userId)
    ).forEach((known) => hasWords.add(known.word))
    const learnWords = (
      await this.learnService.getAllLearnsByWordAndUserId(words, userId)
    ).forEach((learn) => hasWords.add(learn.word))
    const relevanceWords = (
      await this.relevanceService.getAllRelevancesByWordAndUserId(words, userId)
    ).forEach((relevance) => hasWords.add(relevance.word))

    return hasWords
  }
  private async getHasWordsWithId(words: string[], userId: string) {
    const hasWords = new Map<string, string>()

    const knownWords = (
      await this.getAllKnownsByWordAndUserId(words, userId)
    ).forEach((known) => hasWords.set(known.word, known.id))
    const learnWords = (
      await this.learnService.getAllLearnsByWordAndUserId(words, userId)
    ).forEach((learn) => hasWords.set(learn.word, learn.id))
    const relevanceWords = (
      await this.relevanceService.getAllRelevancesByWordAndUserId(words, userId)
    ).forEach((relevance) => hasWords.set(relevance.word, relevance.id))

    return hasWords
  }

  private async checkHasWord(word: string, id: string, userId: string) {
    const knownWords = await this.getKnownByWordAndUserId(word, userId)
    if (knownWords && knownWords.id !== id)
      throw new BadRequestException(ERROR_MESSAGES.hasWord)

    const learnWords = await this.learnService.getLearnByWordAndUserId(
      word,
      userId,
    )
    if (learnWords) throw new BadRequestException(ERROR_MESSAGES.hasWord)

    const relevanceWords =
      await this.relevanceService.getRelevanceByWordAndUserId(word, userId)
    if (relevanceWords) throw new BadRequestException(ERROR_MESSAGES.hasWord)
  }
}
