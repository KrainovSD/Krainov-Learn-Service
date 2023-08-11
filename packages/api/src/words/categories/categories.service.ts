import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Category } from './categories.model'
import { CreateCategoryDto } from './dto/create-category-dto'
import { UpdateCategoryDto } from './dto/update-category-dro'
import {
  ALLOW_WORDS_TO_START_CATEGORY,
  ERROR_MESSAGES,
  RESPONSE_MESSAGES,
} from 'src/const'
import { _, utils } from 'src/utils/helpers'
import { CategoryIdDto } from './dto/category-id-dto'
import { Learns } from '../learns/learns.model'

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category) private readonly categoryRepo: typeof Category,
  ) {}

  async createCategory(dto: CreateCategoryDto, userId: number) {
    await this.isHasNameCategory(dto.name, userId)
    await this.categoryRepo.create({ ...dto, userId })
    return RESPONSE_MESSAGES.success
  }
  async updateCategory(dto: UpdateCategoryDto, userId: number) {
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
  async deleteCategory(ids: number[], userId: number) {
    const categories = await this.getAllCategoriesById(ids)

    const checkedIds: number[] = []
    for (const category of categories) {
      if (category.userId !== userId) continue
      checkedIds.push(category.id)
    }

    await this.categoryRepo.destroy({ where: { id: checkedIds } })
    return RESPONSE_MESSAGES.success
  }
  async startLearnCategory(dto: CategoryIdDto, userId: number) {
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
  async getAllCategories(userId: number) {
    const categories = await this.getAllCategoriesByUserId(userId)
    if (!categories) throw new NotFoundException(ERROR_MESSAGES.infoNotFound)
    return categories
  }
  async studyCategory() {}

  async getCategoryByNameAndUserId(name: string, userId: number) {
    return await this.categoryRepo.findOne({
      where: {
        name,
        userId,
      },
    })
  }
  async getCategoryById(id: number) {
    return await this.categoryRepo.findByPk(id, {
      include: [Learns],
    })
  }
  async getAllCategoriesById(ids: number[]) {
    return await this.categoryRepo.findAll({ where: { id: ids } })
  }
  async getAllCategoriesByUserId(userId: number) {
    return await this.categoryRepo.findAll({
      where: { userId },
    })
  }

  private async isHasNameCategory(
    name: string,
    userId: number,
    categoryId?: number,
  ) {
    const category = await this.getCategoryByNameAndUserId(name, userId)
    if (!category) return
    if (categoryId && category.id === categoryId) return
    throw new BadRequestException(ERROR_MESSAGES.hasCategory)
  }
}
