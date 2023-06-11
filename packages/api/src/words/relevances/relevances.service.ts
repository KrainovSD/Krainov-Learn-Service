import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Relevance } from './relevances.model'
import { CreateRelevanceDto } from './dto/create-relevance-dto'
import { KnownsService } from '../knowns/knowns.service'
import { LearnsService } from '../learns/learns.service'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { utils } from 'src/utils/helpers'
import { RelevanceIdDto } from './dto/relevance-id.dto'
@Injectable()
export class RelevancesService {
  constructor(
    @InjectModel(Relevance) private readonly relevanceRepo: typeof Relevance,
    private readonly knownService: KnownsService,
    private readonly learnService: LearnsService,
  ) {}

  async createRelevance(dto: CreateRelevanceDto, userId: number) {
    //FIXME: Переписать на приемку массива или обдумать альтернативный способ заполнения
    const known = await this.knownService.getKnownByWordAndUserId(
      dto.word,
      userId,
    )
    if (known) throw new BadRequestException(ERROR_MESSAGES.hasWord)
    const learn = await this.learnService.getLearnsByWordAndUserId(
      dto.word,
      userId,
    )
    if (learn) throw new BadRequestException(ERROR_MESSAGES.hasWord)
    const relevance = await this.getRelevanceByWordAndUserId(dto.word, userId)
    if (relevance) {
      const newDetected = new Date()
      relevance.dateDetected = relevance.dateDetected.concat(newDetected)
      await relevance.save()
      return RESPONSE_MESSAGES.success
    }

    const newDetected = new Date()
    const isIrregularVerb = utils.checkIrregularVerb(dto.word)
    await this.relevanceRepo.create({
      ...dto,
      userId,
      isIrregularVerb,
      dateDetected: [newDetected],
    })

    return RESPONSE_MESSAGES.success
  }
  async deleteRelevance(dto: RelevanceIdDto, userId: number) {
    const relevance = await this.getRelevanceById(dto.id)
    if (!relevance || (relevance && relevance.userId !== userId))
      throw new BadRequestException(ERROR_MESSAGES.infoNotFound)

    await this.relevanceRepo.destroy({
      where: { id: dto.id },
    })

    return RESPONSE_MESSAGES.success
  }
  async getAllRelevance(userId: number) {
    return await this.getAllRelevanceByUserId(userId)
  }

  async getRelevanceByWordAndUserId(word: string, userId: number) {
    const relevance = await this.relevanceRepo.findOne({
      where: { word, userId },
    })
    return relevance
  }
  async getRelevanceById(id: number) {
    const relevance = await this.relevanceRepo.findByPk(id)
    return relevance
  }
  async getAllRelevanceByUserId(userId: number) {
    const relevance = await this.relevanceRepo.findAll({ where: { userId } })
    return relevance
  }
}
