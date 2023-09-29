import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Relevance, RelevanceCreationArgs } from './relevances.model'
import { CreateRelevanceDto } from './dto/create-relevance-dto'
import { KnownsService } from '../knowns/knowns.service'
import { LearnsService } from '../learns/learns.service'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { utils, uuid } from 'src/utils/helpers'
import { WordsService } from 'src/words/words.service'

@Injectable()
export class RelevancesService {
  constructor(
    @InjectModel(Relevance) private readonly relevanceRepo: typeof Relevance,
    @Inject(forwardRef(() => WordsService))
    private readonly wordsService: WordsService,
  ) {}

  async createRelevance(
    dto: CreateRelevanceDto,
    userId: string,
    traceId: string,
  ) {
    const { similarKnowns, similarLearns, similarRelevances } =
      await this.wordsService.getAllSimilarWords(dto.words, userId, '')
    const hasWords = new Set([...similarKnowns, ...similarLearns])

    await this.updateRelevance(Array.from(similarRelevances), userId, traceId)

    const checkedWords = dto.words.reduce(
      (result: RelevanceCreationArgs[], word) => {
        if (hasWords.has(word) || similarRelevances.has(word)) return result

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
  async deleteRelevance(ids: string[], userId: string, traceId: string) {
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
  async updateRelevance(words: string[], userId: string, traceId: string) {
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
  async getAllRelevances(userId: string, traceId: string) {
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
}
