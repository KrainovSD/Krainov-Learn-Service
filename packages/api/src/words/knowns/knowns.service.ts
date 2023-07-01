import { InjectModel } from '@nestjs/sequelize'
import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common'
import { Knowns } from './knowns.model'
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
    await this.checkHasWord(dto.word, dto.userId)

    const isIrregularVerb = utils.checkIrregularVerb(dto.word)
    const dateCreate = new Date()

    await this.knownRepo.create({
      ...dto,
      isIrregularVerb,
      dateCreate,
    })
    return RESPONSE_MESSAGES.success
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

    await this.checkHasWord(dto.word, userId)

    const isIrregularVerb = utils.checkIrregularVerb(dto.word)
    known.isIrregularVerb = isIrregularVerb
    utils.updateNewValue(known, dto, ['id'])
    await known.save()
    return RESPONSE_MESSAGES.success
  }
  async getAllKnowns(userId: number) {
    return await this.getAllKnownsByUserId(userId)
  }

  async getKnownByWordAndUserId(word: string, userId: number) {
    return await this.knownRepo.findOne({ where: { userId, word } })
  }
  async getKnownById(id: number) {
    return await this.knownRepo.findByPk(id)
  }
  async getAllKnownsById(ids: number[]) {
    return await this.knownRepo.findAll({ where: { id: ids } })
  }
  async getAllKnownsByUserId(userId: number) {
    return await this.knownRepo.findAll({ where: { userId } })
  }

  private async checkHasWord(word: string, userId: number) {
    const known = await this.getKnownByWordAndUserId(word, userId)
    if (known) throw new BadRequestException(ERROR_MESSAGES.hasWord)
    const learn = await this.learService.getLearnByWordAndUserId(word, userId)
    if (learn) throw new BadRequestException(ERROR_MESSAGES.hasWord)
    const relevance = await this.relevanceService.getRelevanceByWordAndUserId(
      word,
      userId,
    )
    //FIXME: Придумать другой статус
    if (relevance)
      throw new BadRequestException(ERROR_MESSAGES.hasRelevanceWord)
  }
}
