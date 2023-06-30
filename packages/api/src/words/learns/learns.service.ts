import {
  BadRequestException,
  Injectable,
  forwardRef,
  Inject,
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
import { LearnIdDto } from './dto/learn-id-dto'
import { KnownsService } from '../knowns/knowns.service'
import { RelevancesService } from '../relevances/relevances.service'

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

    const isIrregularVerb = utils.checkIrregularVerb(dto.word)
    await this.learnsRepo.create({ ...dto, isIrregularVerb })

    return RESPONSE_MESSAGES.success
  }
  async deleteLearn(dto: LearnIdDto, userId: number) {
    const learn = await this.getLearnById(dto.id)
    if (!learn) throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    const category = await this.getOwnCategory(learn.categoryId, userId)
    if (
      category.isLearn &&
      category.learns.length <= ALLOW_WORDS_AFTER_DELETE_FROM_START_CATEGORY
    ) {
      throw new BadRequestException(ERROR_MESSAGES.isLearnCategory)
    }

    await this.learnsRepo.destroy({ where: { id: dto.id } })
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

    await this.checkHasWord(dto.word, userId)

    const isIrregularVerb = utils.checkIrregularVerb(dto.word)
    learn.isIrregularVerb = isIrregularVerb

    utils.updateNewValue(learn, dto, ['id'])
    await learn.save()
    return RESPONSE_MESSAGES.success
  }
  async getAllLearns(userId: number) {
    const learns = await this.getLearnsByUserId(userId)
    if (!learns) throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    return learns
  }

  async getLearnsByUserId(userId: number) {
    //FIXME: Исправить
    const categories = await this.categoryService.getCategoriesByUserId(
      userId,
      true,
    )
    if (!categories) throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    const learns = categories.reduce((result: Learns[], category) => {
      return result.concat(category.learns)
    }, [])
    return learns
  }
  async getLearnById(id: number) {
    const learn = await this.learnsRepo.findByPk(id)
    return learn
  }
  async getLearnsByWordAndUserId(word: string, userId: number) {
    //FIXME: Исправить
    const learns = await this.getLearnsByUserId(userId)
    return learns.reduce((result: Learns | null, learn) => {
      if (learn.word === word) {
        result = learn
        return result
      }
      return result
    }, null)
  }

  private async getOwnCategory(categoryId: number, userId: number) {
    const category = await this.categoryService.getCategoryById(categoryId)
    if (!category || (category && category.userId !== userId))
      throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    return category
  }
  private async checkHasWord(word: string, userId: number) {
    const known = await this.knownService.getKnownByWordAndUserId(word, userId)
    if (known) throw new BadRequestException(ERROR_MESSAGES.hasWord)
    const learn = await this.getLearnsByWordAndUserId(word, userId)
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
