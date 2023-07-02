import { InjectModel } from '@nestjs/sequelize'
import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common'
import { Knowns, KnownsCreationArgs } from './knowns.model'
import { CreateKnownsDto } from './dto/create-knowns-dto'
import { utils } from 'src/utils/helpers'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { UpdateKnownsDto } from './dto/update-knowns-dto'
import { LearnsService } from '../learns/learns.service'
import { RelevancesService } from '../relevances/relevances.service'

@Injectable()
export class KnownsService {
  constructor(
    @InjectModel(Knowns) private readonly knownRepo: typeof Knowns,
    @Inject(forwardRef(() => LearnsService))
    private readonly learnService: LearnsService,
    @Inject(forwardRef(() => RelevancesService))
    private readonly relevanceService: RelevancesService,
  ) {}

  async createKnown(dto: CreateKnownsDto, userId: number) {
    const words: string[] = dto.words.map((known) => known.word)
    const hasWords = await this.getHasWords(words, userId)

    const checkedWords = dto.words.reduce(
      (result: KnownsCreationArgs[], known) => {
        if (hasWords.has(known.word)) return result

        const isIrregularVerb = utils.checkIrregularVerb(known.word)
        const dateCreate = new Date()
        const checkedWord = {
          ...known,
          isIrregularVerb,
          dateCreate,
          userId: userId,
        }
        result.push(checkedWord)
        return result
      },
      [],
    )

    await this.knownRepo.bulkCreate(checkedWords)
    return hasWords.size === 0
      ? RESPONSE_MESSAGES.success
      : RESPONSE_MESSAGES.existWords(hasWords)
  }
  async deleteKnown(ids: number[], userId: number) {
    const knowns = await this.getAllKnownsById(ids)

    const checkedIds: number[] = []
    for (const known of knowns) {
      if (known.userId !== userId) continue
      checkedIds.push(known.id)
    }

    await this.knownRepo.destroy({ where: { id: checkedIds } })

    return RESPONSE_MESSAGES.success
  }
  async updateKnown(dto: UpdateKnownsDto, userId: number) {
    const known = await this.getKnownById(dto.id)
    if (!known || (known && known.userId !== userId))
      throw new BadRequestException(ERROR_MESSAGES.infoNotFound)

    await this.checkHasWord(dto.word, dto.id, userId)

    const isIrregularVerb = utils.checkIrregularVerb(dto.word)
    known.isIrregularVerb = isIrregularVerb
    utils.updateNewValue(known, dto, ['id'])
    await known.save()
    return RESPONSE_MESSAGES.success
  }
  async getAllKnowns(userId: number) {
    return await this.getAllKnownsByUserId(userId)
  }
  async studyKnown() {}

  async getKnownById(id: number) {
    return await this.knownRepo.findByPk(id)
  }
  async getKnownByWordAndUserId(word: string, userId: number) {
    return await this.knownRepo.findOne({ where: { userId, word } })
  }
  async getAllKnownsById(ids: number[]) {
    return await this.knownRepo.findAll({ where: { id: ids } })
  }
  async getAllKnownsByUserId(userId: number) {
    return await this.knownRepo.findAll({ where: { userId } })
  }
  async getAllKnownsByWordAndUserId(words: string | string[], userId: number) {
    return await this.knownRepo.findAll({ where: { userId, word: words } })
  }

  private async getHasWords(words: string | string[], userId: number) {
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
  private async checkHasWord(word: string, id: number, userId: number) {
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
