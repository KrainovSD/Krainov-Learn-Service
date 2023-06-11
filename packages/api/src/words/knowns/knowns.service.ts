import { InjectModel } from '@nestjs/sequelize'
import { BadRequestException, Injectable } from '@nestjs/common'
import { Knowns } from './knowns.model'
import { CreateKnownsDto } from './dto/create-knowns-dto'
import { utils } from 'src/utils/helpers'
import { KnownIdDto } from './dto/known-id-dto'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { UpdateKnownsDto } from './dto/update-knowns-dto'
import { LearnsService } from '../learns/learns.service'
import { RelevancesService } from '../relevances/relevances.service'

@Injectable()
export class KnownsService {
  constructor(
    @InjectModel(Knowns) private readonly knownRepo: typeof Knowns,
    private readonly learService: LearnsService,
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
  async deleteKnown(dto: KnownIdDto, userId: number) {
    const known = await this.getKnownById(dto.id)
    if (!known || (known && known.userId !== userId))
      throw new BadRequestException(ERROR_MESSAGES.infoNotFound)

    await this.knownRepo.destroy({ where: { id: dto.id } })

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
  async getAllKnown(userId: number) {
    return await this.getAllKnownByUserId(userId)
  }

  async getKnownByWordAndUserId(word: string, userId: number) {
    const known = await this.knownRepo.findOne({ where: { userId, word } })
    return known
  }
  async getKnownById(id: number) {
    const known = await this.knownRepo.findByPk(id)
    return known
  }
  async getAllKnownByUserId(userId: number) {
    const known = await this.knownRepo.findAll({ where: { userId } })
    return known
  }
  private async checkHasWord(word: string, userId: number) {
    const known = await this.getKnownByWordAndUserId(word, userId)
    if (known) throw new BadRequestException(ERROR_MESSAGES.hasWord)
    const learn = await this.learService.getLearnsByWordAndUserId(word, userId)
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
