import { BadRequestException, Injectable } from '@nestjs/common'
import { Learns } from './learns.model'
import { InjectModel } from '@nestjs/sequelize'
import { CreateLearnDto } from './dto/create-learns-dto'
import { CategoriesService } from '../categories/categories.service'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { checkIrregularVerb } from 'src/utils/helpers'

@Injectable()
export class LearnsService {
  constructor(
    @InjectModel(Learns) private readonly learnsRepo: typeof Learns,
    private readonly categoryService: CategoriesService,
  ) {}

  async createLearn(dto: CreateLearnDto, userId: number) {
    const category = await this.categoryService.getCategoryById(dto.categoryId)
    if (!category) throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    if (category.isLearn)
      throw new BadRequestException(ERROR_MESSAGES.isLearnCategory)

    //FIXME: Проверка на наличие такого слова во всех местах
    const isIrregularVerb = checkIrregularVerb(dto.word)
    await this.learnsRepo.create({ ...dto, userId, isIrregularVerb })

    return RESPONSE_MESSAGES.success
  }

  async getAllLearns(userId: number) {
    const learns = await this.learnsRepo.findAll({ where: { userId } })
    return learns
  }
}
