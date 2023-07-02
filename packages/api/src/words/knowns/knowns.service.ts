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
    private readonly learService: LearnsService,
    @Inject(forwardRef(() => RelevancesService))
    private readonly relevanceService: RelevancesService,
  ) {}

  async createKnown(dto: CreateKnownsDto) {
    const words: string[] = dto.knowns.map((known) => known.word)
    const hasWords = await this.getHasWords(words, dto.userId)

    const checkedKnowns = dto.knowns.reduce(
      (result: KnownsCreationArgs[], known) => {
        if (hasWords.has(known.word)) return result

        const isIrregularVerb = utils.checkIrregularVerb(known.word)
        const dateCreate = new Date()
        const checkedKnown = {
          ...known,
          isIrregularVerb,
          dateCreate,
          userId: dto.userId,
        }
        result.push(checkedKnown)
        return result
      },
      [],
    )

    await this.knownRepo.bulkCreate(checkedKnowns)
    return hasWords.size === 0
      ? RESPONSE_MESSAGES.success
      : {
          message: `Следующие слова не были добавлены, так как они уже существуют: ${Array.from(
            hasWords,
          ).join(', ')}`,
        }
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
  async getAllKnownsByWordAndUserId(word: string | string[], userId: number) {
    return await this.knownRepo.findAll({ where: { userId, word } })
  }

  private async getHasWords(word: string | string[], userId: number) {
    const words = new Set<string>()

    const knownWords = (
      await this.getAllKnownsByWordAndUserId(word, userId)
    ).forEach((known) => words.add(known.word))
    const learnWords = (
      await this.learService.getAllLearnsByWordAndUserId(word, userId)
    ).forEach((learn) => words.add(learn.word))
    const relevanceWords = (
      await this.relevanceService.getAllRelevancesByWordAndUserId(word, userId)
    ).forEach((relevance) => words.add(relevance.word))

    return words
  }
  private async checkHasWord(word: string, id: number, userId: number) {
    const knownWords = await this.getKnownByWordAndUserId(word, userId)
    if (knownWords && knownWords.id !== id)
      throw new BadRequestException(ERROR_MESSAGES.hasWord)

    const learnWords = await this.learService.getLearnByWordAndUserId(
      word,
      userId,
    )
    if (learnWords) throw new BadRequestException(ERROR_MESSAGES.hasWord)

    const relevanceWords =
      await this.relevanceService.getRelevanceByWordAndUserId(word, userId)
    if (relevanceWords) throw new BadRequestException(ERROR_MESSAGES.hasWord)
  }
}
