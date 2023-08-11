import {
  BadRequestException,
  Injectable,
  forwardRef,
  Inject,
  HttpStatus,
  HttpException,
} from '@nestjs/common'
import { Learns } from './learns.model'
import { InjectModel } from '@nestjs/sequelize'
import { CreateLearnDto } from './dto/create-learns-dto'
import { CategoriesService } from '../categories/categories.service'
import {
  ALLOW_WORDS_AFTER_DELETE_FROM_START_CATEGORY,
  ERROR_MESSAGES,
  RESPONSE_MESSAGES,
} from 'src/const'
import { utils } from 'src/utils/helpers'
import { UpdateLearnsDto } from './dto/update-learns.dto'
import { KnownsService } from '../knowns/knowns.service'
import { RelevancesService } from '../relevances/relevances.service'
import { Category } from '../categories/categories.model'

@Injectable()
export class LearnsService {
  constructor(
    @InjectModel(Learns) private readonly learnsRepo: typeof Learns,
    private readonly categoryService: CategoriesService,
    @Inject(forwardRef(() => KnownsService))
    private readonly knownService: KnownsService,
    @Inject(forwardRef(() => RelevancesService))
    private readonly relevanceService: RelevancesService,
  ) {}

  async createLearn(dto: CreateLearnDto, userId: number) {
    const category = await this.getOwnCategory(dto.categoryId, userId)
    if (category.isLearn)
      throw new BadRequestException(ERROR_MESSAGES.isLearnCategory)

    await this.checkHasWord(dto.word, userId)

    const isIrregularVerb = utils.common.checkIrregularVerb(dto.word)
    await this.learnsRepo.create({ ...dto, isIrregularVerb })

    return RESPONSE_MESSAGES.success
  }
  async deleteLearn(ids: number[], categoryId: number, userId: number) {
    const learns = await this.getAllLearnsById(ids)

    const category = await this.getOwnCategory(categoryId, userId)
    if (
      category.isLearn &&
      category.learns.length <= ALLOW_WORDS_AFTER_DELETE_FROM_START_CATEGORY
    )
      throw new BadRequestException(ERROR_MESSAGES.isLearnCategory)

    const checkedIds: number[] = []
    for (const learn of learns) {
      if (learn.categoryId === categoryId) checkedIds.push(learn.id)
    }

    await this.learnsRepo.destroy({ where: { id: checkedIds } })
    return RESPONSE_MESSAGES.success
  }
  async updateLearn(dto: UpdateLearnsDto, userId: number) {
    const newCategory = await this.getOwnCategory(dto.categoryId, userId)
    const learn = await this.getLearnById(dto.id)
    if (!learn) throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    if (learn.categoryId !== dto.categoryId) {
      const odlCategory = await this.getOwnCategory(learn.categoryId, userId)
      if (odlCategory.isLearn || newCategory.isLearn)
        throw new BadRequestException(ERROR_MESSAGES.isLearnCategory)
    }

    await this.checkHasWord(dto.word, userId, dto.id)

    const isIrregularVerb = utils.common.checkIrregularVerb(dto.word)
    learn.isIrregularVerb = isIrregularVerb

    utils.common.updateNewValue(learn, dto, ['id'])
    await learn.save()
    return RESPONSE_MESSAGES.success
  }
  async getAllLearns(userId: number) {
    const learns = await this.getAllLearnsByUserId(userId)
    if (!learns) throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    return learns
  }
  async studyLearn() {}

  async getLearnById(id: number) {
    return await this.learnsRepo.findByPk(id)
  }
  async getLearnByWordAndUserId(word: string, userId: number) {
    return await this.learnsRepo.findOne({
      where: { word },
      include: [
        {
          model: Category,
          attributes: ['id'],
          where: { userId },
        },
      ],
      raw: true,
    })
  }
  async getAllLearnsByUserId(userId: number) {
    return await this.learnsRepo.findAll({
      where: {},
      include: [
        {
          model: Category,
          attributes: ['id'],
          where: { userId },
        },
      ],
      raw: true,
    })
  }
  async getAllLearnsById(ids: number[]) {
    return await this.learnsRepo.findAll({ where: { id: ids } })
  }
  async getAllLearnsByWordAndUserId(word: string | string[], userId: number) {
    return await this.learnsRepo.findAll({
      where: { word },
      include: [
        {
          model: Category,
          attributes: ['id'],
          where: { userId },
        },
      ],
      raw: true,
    })
  }

  private async getOwnCategory(categoryId: number, userId: number) {
    const category = await this.categoryService.getCategoryById(categoryId)
    if (!category || (category && category.userId !== userId))
      throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    return category
  }
  private async checkHasWord(word: string, userId: number, id?: number) {
    const known = await this.knownService.getKnownByWordAndUserId(word, userId)
    if (known) throw new BadRequestException(ERROR_MESSAGES.hasWord)

    const learn = await this.getLearnByWordAndUserId(word, userId)
    if (id && learn && learn.id !== id)
      throw new BadRequestException(ERROR_MESSAGES.hasWord)
    if (!id && learn) throw new BadRequestException(ERROR_MESSAGES.hasWord)

    const relevance = await this.relevanceService.getRelevanceByWordAndUserId(
      word,
      userId,
    )
    if (relevance)
      throw new HttpException(
        ERROR_MESSAGES.hasRelevanceWord,
        HttpStatus.ACCEPTED,
      )
  }
}
