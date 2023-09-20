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
import {
  ALLOW_WORDS_TO_START_CATEGORY,
  ERROR_MESSAGES,
  RESPONSE_MESSAGES,
} from 'src/const'
import { _, utils, uuid } from 'src/utils/helpers'
import { CategoryIdDto } from './dto/category-id-dto'
import { Learns } from '../learns/learns.model'
import { Op, Transaction } from 'sequelize'
import { WorkKind } from '../work/work.service'
import { LearnsService } from '../learns/learns.service'
import { KnownsService } from '../knowns/knowns.service'

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category) private readonly categoryRepo: typeof Category,
    @Inject(forwardRef(() => LearnsService))
    private readonly learnService: LearnsService,
    @Inject(forwardRef(() => KnownsService))
    private readonly knownsService: KnownsService,
  ) {}

  async createCategory(dto: CreateCategoryDto, userId: string) {
    await this.isHasNameCategory(dto.name, userId)
    await this.categoryRepo.create({ ...dto, userId, id: uuid() })
    return RESPONSE_MESSAGES.success
  }
  async updateCategory(dto: UpdateCategoryDto, userId: string) {
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
  async deleteCategory(ids: string[], userId: string) {
    const categories = await this.getAllCategoriesById(ids)

    const checkedIds: string[] = []
    for (const category of categories) {
      if (category.userId !== userId) continue
      checkedIds.push(category.id)
    }

    await this.categoryRepo.destroy({ where: { id: checkedIds } })
    return RESPONSE_MESSAGES.success
  }
  async startLearnCategory(dto: CategoryIdDto, userId: string) {
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
  async getAllCategories(userId: string) {
    const categories = await this.getAllCategoriesByUserId(userId)
    if (!categories) throw new NotFoundException(ERROR_MESSAGES.infoNotFound)
    return categories
  }
  async studyCategory(ids: string[], userId: string, kind: WorkKind) {
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
        if (category.repeatRegularity.length >= countRepeat) {
          const countAnotherRepeat =
            category[kind === 'normal' ? 'countReverseRepeat' : 'countRepeat']
          if (category.repeatRegularity.length >= countAnotherRepeat) {
            completedCategoryInfo.set(category.id, category.learnStartDate)
            return result
          }
        }

        /* if not done */
        const nextRepeat = utils.date.getDate(
          category.repeatRegularity[countRepeat],
          'days',
        )

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
      const completedWords = (
        await this.learnService.getAllLearnsByCategoryIds([
          ...completedCategoryInfo.keys(),
        ])
      ).map((word) => {
        return {
          ...word,
          dateStartLearn:
            completedCategoryInfo.get(word.categoryId) ?? new Date(),
        }
      })
      await this.knownsService.createKnown(completedWords, userId)
      await this.deleteCategory([...completedCategoryInfo.keys()], userId)
    }
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
