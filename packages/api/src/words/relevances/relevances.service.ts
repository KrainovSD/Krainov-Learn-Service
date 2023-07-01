import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Relevance } from './relevances.model'
import { CreateRelevanceDto } from './dto/create-relevance-dto'
import { KnownsService } from '../knowns/knowns.service'
import { LearnsService } from '../learns/learns.service'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { utils } from 'src/utils/helpers'

@Injectable()
export class RelevancesService {
  constructor(
    @InjectModel(Relevance) private readonly relevanceRepo: typeof Relevance,
    @Inject(forwardRef(() => KnownsService))
    private readonly knownService: KnownsService,
    @Inject(forwardRef(() => LearnsService))
    private readonly learnService: LearnsService,
  ) {}

  async createRelevance(dto: CreateRelevanceDto, userId: number) {
    //FIXME: Переписать на приемку массива или обдумать альтернативный способ заполнения
    const known = await this.knownService.getKnownByWordAndUserId(
      dto.word,
      userId,
    )
    if (known) throw new BadRequestException(ERROR_MESSAGES.hasWord)
    const learn = await this.learnService.getLearnByWordAndUserId(
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
  async deleteRelevance(ids: number[], userId: number) {
    const relevances = await this.getAllRelevancesById(ids)

    const checkedIds: number[] = []
    for (const relevance of relevances) {
      if (relevance.userId !== userId) continue
      checkedIds.push(relevance.id)
    }

    await this.relevanceRepo.destroy({
      where: { id: checkedIds },
    })

    return RESPONSE_MESSAGES.success
  }
  async getAllRelevances(userId: number) {
    return await this.getAllRelevancesByUserId(userId)
  }

  async getRelevanceByWordAndUserId(word: string, userId: number) {
    return await this.relevanceRepo.findOne({
      where: { word, userId },
    })
  }
  async getRelevanceById(id: number) {
    return await this.relevanceRepo.findByPk(id)
  }
  async getAllRelevancesByUserId(userId: number) {
    return await this.relevanceRepo.findAll({ where: { userId } })
  }
  async getAllRelevancesById(ids: number[]) {
    return await this.relevanceRepo.findAll({ where: { id: ids } })
  }
}
