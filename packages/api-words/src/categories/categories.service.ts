import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Category, CategoryCreationArgs } from './categories.model'
import { CreateCategoryDto } from './dto/create-category-dto'
import { UpdateCategoryDto } from './dto/update-category-dro'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { _, utils, uuid } from 'src/utils/helpers'
import { CategoryIdDto } from './dto/category-id-dto'
import { Learns } from '../learns/learns.model'
import { Op } from 'sequelize'
import { ALLOW_WORDS_TO_START_CATEGORY } from './categories.constants'
import { WordsService } from 'src/words/words.service'

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category) private readonly categoryRepo: typeof Category,
    @Inject(forwardRef(() => WordsService))
    private readonly wordsService: WordsService,
  ) {}

  async createCategory(
    dto: CreateCategoryDto,
    userId: string,
    traceId: string,
  ) {
    await this.isHasNameCategory(dto.name, userId)
    await this.categoryRepo.create({ ...dto, userId, id: uuid() })
    return RESPONSE_MESSAGES.success
  }
  async updateCategory(
    dto: UpdateCategoryDto,
    userId: string,
    traceId: string,
  ) {
    await this.isHasNameCategory(dto.name, userId, dto.id)
    const category = await this.getCategoryById(dto.id)
    if (!category || (category && category.userId !== userId))
      throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    if (category.isLearn)
      throw new BadRequestException(ERROR_MESSAGES.isLearnCategory)

    utils.common.updateNewValue(category, dto, ['id'])
    await category.save()
    return RESPONSE_MESSAGES.success
  }
  async deleteCategory(ids: string[], userId: string, traceId: string) {
    const categories = await this.getAllCategoriesByIdAndUserId(ids, userId)

    await this.categoryRepo.destroy({
      where: { id: categories.map((category) => category.id) },
    })
    return RESPONSE_MESSAGES.success
  }
  async startLearnCategory(
    dto: CategoryIdDto,
    userId: string,
    traceId: string,
  ) {
    const category = await this.getCategoryById(dto.id)
    if (!category || (category && category.userId !== userId))
      throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    if (category.learns.length < ALLOW_WORDS_TO_START_CATEGORY)
      throw new BadRequestException(ERROR_MESSAGES.lowWordsInCategory)
    if (category.isLearn)
      throw new BadRequestException(ERROR_MESSAGES.isLearnCategory)

    category.isLearn = true
    category.nextRepeat = utils.date.getDate(1, 'days')
    category.nextReverseRepeat = utils.date.getDate(1, 'days')
    await category.save()
    return RESPONSE_MESSAGES.success
  }
  async getAllCategories(userId: string, traceId: string) {
    const categories = await this.getAllCategoriesByUserId(userId)
    if (!categories) throw new NotFoundException(ERROR_MESSAGES.infoNotFound)
    return categories
  }
  async studyCategory(
    ids: string[],
    userId: string,
    kind: SessionType,
    traceId: string,
  ) {
    if (ids.length === 0) return

    const categories = await this.getAllCategoriesById(ids)

    const completedCategoryInfo: Map<string, Date> = new Map()
    const editedCategories: CategoryCreationArgs[] = categories.reduce(
      (result: CategoryCreationArgs[], category) => {
        if (category.userId !== userId || !category.learnStartDate) {
          return result
        }
        const countRepeat =
          category[kind === 'normal' ? 'countRepeat' : 'countReverseRepeat'] + 1
        /* if done word */
        if (category.repeatRegularity.length <= countRepeat) {
          const countAnotherRepeat =
            category[kind === 'normal' ? 'countReverseRepeat' : 'countRepeat']
          if (category.repeatRegularity.length <= countAnotherRepeat) {
            completedCategoryInfo.set(category.id, category.learnStartDate)
            return result
          }
        }

        /* if not done */
        const nextRepeat =
          category.repeatRegularity.length <= countRepeat
            ? null
            : utils.date.getDate(category.repeatRegularity[countRepeat], 'days')

        result.push({
          ...category,
          [kind === 'normal' ? 'countRepeat' : 'countReverseRepeat']:
            countRepeat,
          [kind === 'normal' ? 'nextRepeat' : 'nextReverseRepeat']: nextRepeat,
        })
        return result
      },
      [],
    )
    await this.categoryRepo.bulkCreate(editedCategories, {
      updateOnDuplicate: ['id'],
    })

    if (completedCategoryInfo.size > 0) {
      this.wordsService.completeCategory(completedCategoryInfo, userId, traceId)
    }
  }
  async deleteCategoriesByUserIds(userIds: string[], traceId: string) {
    await this.categoryRepo.destroy({ where: { userId: userIds } })
  }

  async getCategoryByNameAndUserId(name: string, userId: string) {
    return await this.categoryRepo.findOne({
      where: {
        name,
        userId,
      },
    })
  }
  async getCategoryById(id: string) {
    return await this.categoryRepo.findByPk(id, {
      include: [Learns],
    })
  }
  async getAllCategoriesByIdAndUserId(ids: string[], userId: string) {
    return await this.categoryRepo.findAll({ where: { id: ids, userId } })
  }
  async getAllCategoriesById(ids: string[]) {
    return await this.categoryRepo.findAll({ where: { id: ids } })
  }
  async getAllCategoriesByUserId(userId: string) {
    return await this.categoryRepo.findAll({
      where: { userId },
    })
  }
  async getCategoriesNameByIds(ids: string[]) {
    return await this.categoryRepo.findAll({
      attributes: ['name'],
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    })
  }
  async getCategoriesForNormalSession(
    userId: string,
  ): Promise<Pick<Category, 'id'>[]> {
    return await this.categoryRepo.findAll({
      attributes: ['id'],
      where: {
        userId,
        nextRepeat: {
          [Op.lte]: utils.date.getTomorrow(),
        },
      },
    })
  }
  async getCategoriesForReverseSession(
    userId: string,
  ): Promise<Pick<Category, 'id'>[]> {
    return await this.categoryRepo.findAll({
      attributes: ['id'],
      where: {
        userId,
        nextReverseRepeat: {
          [Op.lte]: utils.date.getTomorrow(),
        },
      },
    })
  }

  private async isHasNameCategory(
    name: string,
    userId: string,
    categoryId?: string,
  ) {
    const category = await this.getCategoryByNameAndUserId(name, userId)
    if (!category) return
    if (categoryId && category.id === categoryId) return
    throw new BadRequestException(ERROR_MESSAGES.hasCategory)
  }
}
