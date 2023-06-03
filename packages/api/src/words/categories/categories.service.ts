import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Category } from './categories.model'
import { CreateCategoryDto } from './dto/create-category-dto'
import { UpdateCategoryDto } from './dto/update-category-dro'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { _ } from 'src/utils/helpers'
import { CategoryIdDto } from './dto/category-id-dto'

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

    for (const field in dto) {
      const categoryValue = _.get(category, field, null)
      const dtoValue = _.get(dto, field, null)
      if (categoryValue !== dtoValue) _.set(category, field, dtoValue)
    }

    await category.save()
    return RESPONSE_MESSAGES.success
  }
  async deleteCategory(dto: CategoryIdDto, userId: number) {
    await this.categoryRepo.destroy({
      where: {
        id: dto.id,
        userId,
      },
    })
    return RESPONSE_MESSAGES.success
  }
  async getAllCategories(userId: number) {
    const categories = await this.categoryRepo.findAll({ where: { userId } })
    if (!categories) throw new NotFoundException(ERROR_MESSAGES.infoNotFound)
    return categories
  }

  async getCategoryByNameAndUserId(name: string, userId: number) {
    const category = await this.categoryRepo.findOne({
      where: {
        name,
        userId,
      },
    })
    return category
  }
  async getCategoryById(id: number) {
    const category = await this.categoryRepo.findByPk(id)
    return category
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
