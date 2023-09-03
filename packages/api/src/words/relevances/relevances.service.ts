import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Relevance, RelevanceCreationArgs } from './relevances.model'
import { CreateRelevanceDto } from './dto/create-relevance-dto'
import { KnownsService } from '../knowns/knowns.service'
import { LearnsService } from '../learns/learns.service'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { utils, uuid } from 'src/utils/helpers'
import { LoggerService } from 'src/logger/logger.service'

@Injectable()
export class RelevancesService {
  constructor(
    @InjectModel(Relevance) private readonly relevanceRepo: typeof Relevance,
    @Inject(forwardRef(() => KnownsService))
    private readonly knownService: KnownsService,
    @Inject(forwardRef(() => LearnsService))
    private readonly learnService: LearnsService,
    private readonly loggerService: LoggerService,
  ) {}

  async createRelevance(dto: CreateRelevanceDto, userId: string) {
    const hasWords = await this.getHasWords(dto.words, userId)
    const hasRelevanceWords = await this.getHasRelevanceWords(dto.words, userId)

    this.loggerService.info('test', 'test')

    await this.updateRelevance(Array.from(hasRelevanceWords), userId)

    const checkedWords = dto.words.reduce(
      (result: RelevanceCreationArgs[], word) => {
        if (hasWords.has(word) || hasRelevanceWords.has(word)) return result

        result.push({
          id: uuid(),
          word,
          dateDetected: [new Date()],
          isIrregularVerb: utils.common.checkIrregularVerb(word),
          userId,
        })
        return result
      },
      [],
    )

    await this.relevanceRepo.bulkCreate(checkedWords)

    return hasWords.size === 0
      ? RESPONSE_MESSAGES.success
      : RESPONSE_MESSAGES.existWords(hasWords)
  }
  async deleteRelevance(ids: string[], userId: string) {
    const relevances = await this.getAllRelevancesById(ids)

    const checkedIds: string[] = []
    for (const relevance of relevances) {
      if (relevance.userId !== userId) continue
      checkedIds.push(relevance.id)
    }

    await this.relevanceRepo.destroy({
      where: { id: checkedIds },
    })

    return RESPONSE_MESSAGES.success
  }
  async updateRelevance(words: string[], userId: string) {
    const updatedRelevances: RelevanceCreationArgs[] = (
      await this.getAllRelevancesByWordAndUserId(words, userId)
    ).map((relevance) => {
      return {
        id: relevance.id,
        userId: relevance.userId,
        word: relevance.word,
        isIrregularVerb: relevance.isIrregularVerb,
        dateDetected: [...relevance.dateDetected, new Date()],
      }
    })

    await this.relevanceRepo.bulkCreate(updatedRelevances, {
      updateOnDuplicate: ['dateDetected'],
    })
  }
  async getAllRelevances(userId: string) {
    return await this.getAllRelevancesByUserId(userId)
  }

  async getRelevanceById(id: string) {
    return await this.relevanceRepo.findByPk(id)
  }
  async getRelevanceByWordAndUserId(word: string, userId: string) {
    return await this.relevanceRepo.findOne({
      where: { word, userId },
    })
  }
  async getAllRelevancesByUserId(userId: string) {
    return await this.relevanceRepo.findAll({ where: { userId } })
  }
  async getAllRelevancesById(ids: string[]) {
    return await this.relevanceRepo.findAll({ where: { id: ids } })
  }
  async getAllRelevancesByWordAndUserId(
    words: string | string[],
    userId: string,
  ) {
    return await this.relevanceRepo.findAll({
      where: { word: words, userId },
    })
  }

  private async getHasWords(words: string[], userId: string) {
    const hasWords = new Set<string>()

    const knownWords = (
      await this.knownService.getAllKnownsByWordAndUserId(words, userId)
    ).forEach((known) => hasWords.add(known.word))
    const learnWords = (
      await this.learnService.getAllLearnsByWordAndUserId(words, userId)
    ).forEach((learn) => hasWords.add(learn.word))

    return hasWords
  }
  private async getHasRelevanceWords(words: string[], userId: string) {
    const hasWords = new Set<string>()

    const relevances = (
      await this.getAllRelevancesByWordAndUserId(words, userId)
    ).forEach((relevance) => hasWords.add(relevance.word))

    return hasWords
  }
}
