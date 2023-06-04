import { BadRequestException, Injectable } from '@nestjs/common'
import { Learns } from './learns.model'
import { InjectModel } from '@nestjs/sequelize'
import { CreateLearnDto } from './dto/create-learns-dto'
import { CategoriesService } from '../categories/categories.service'
import {
  ALLOW_WORDS_AFTER_DELETE_FROM_START_CATEGORY,
  ERROR_MESSAGES,
  RESPONSE_MESSAGES,
} from 'src/const'
import { checkIrregularVerb, updateNewValue } from 'src/utils/helpers'
import { UpdateLearnsDto } from './dto/update-learns.dto'
import { LearnIdDto } from './dto/learn-id-dto'

@Injectable()
export class LearnsService {
  constructor(
    @InjectModel(Learns) private readonly learnsRepo: typeof Learns,
    private readonly categoryService: CategoriesService,
  ) {}

  async createLearn(dto: CreateLearnDto, userId: number) {
    const category = await this.getOwnCategory(dto.categoryId, userId)
    if (category.isLearn)
      throw new BadRequestException(ERROR_MESSAGES.isLearnCategory)

    //FIXME: Проверка на наличие такого слова тут и в изученных и отдельно в актуализаторе
    const isIrregularVerb = checkIrregularVerb(dto.word)
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

    //FIXME: Проверка на наличие такого слова тут и в изученных и отдельно в актуализаторе

    const isIrregularVerb = checkIrregularVerb(dto.word)
    learn.isIrregularVerb = isIrregularVerb

    updateNewValue(learn, dto, ['id'])
    await learn.save()
    return RESPONSE_MESSAGES.success
  }
  async getAllLearns(userId: number) {
    const learns = await this.getLearnsByUserId(userId)
    if (!learns) throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    return learns
  }

  async getLearnsByUserId(userId: number) {
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
  private async getOwnCategory(categoryId: number, userId: number) {
    const category = await this.categoryService.getCategoryById(categoryId)
    if (!category || (category && category.userId !== userId))
      throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    return category
  }
}
