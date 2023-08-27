import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Statistic } from './statistics.model'
import { utils, uuid } from 'src/utils/helpers'
import { UpdateStatisticDto } from './dto/update-statistic.dto'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { KnownsService } from 'src/words/knowns/knowns.service'
import { CategoriesService } from 'src/words/categories/categories.service'
import { RepeatsService } from 'src/words/repeats/repeats.service'

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Statistic) private readonly statisticRepo: typeof Statistic,
    @Inject(forwardRef(() => KnownsService))
    private readonly knownsService: KnownsService,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
    @Inject(forwardRef(() => RepeatsService))
    private readonly repeatsService: RepeatsService,
  ) {}

  async createStatistic(userId: string) {
    const statistic = await this.statisticRepo.create({
      id: uuid(),
      userId,
    })
    return statistic
  }
  async updateStatistic(dto: UpdateStatisticDto, userId: string) {
    const statistic = await this.getStatisticByUserId(userId)
    if (!statistic) throw new BadRequestException(ERROR_MESSAGES.userNotFound)

    utils.common.updateNewValue(statistic, dto)
    await statistic.save()
    return RESPONSE_MESSAGES.success
  }

  async getStatisticByUserId(userId: string) {
    return await this.statisticRepo.findOne({
      where: {
        userId,
      },
    })
  }

  async checkStreak(userId: string) {
    return false
  }
}
