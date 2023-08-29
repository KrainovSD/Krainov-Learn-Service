import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/sequelize'
import { Statistic } from './statistics.model'
import { utils, uuid } from 'src/utils/helpers'
import { UpdateStatisticDto } from './dto/update-statistic.dto'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { CategoriesService } from 'src/words/categories/categories.service'
import { RepeatsService } from 'src/words/repeats/repeats.service'
import { Sequelize } from 'sequelize-typescript'
import { SessionsService } from 'src/words/sessions/sessions.service'

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Statistic) private readonly statisticRepo: typeof Statistic,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
    @Inject(forwardRef(() => RepeatsService))
    private readonly repeatsService: RepeatsService,
    private readonly sessionsService: SessionsService,
    @InjectConnection()
    private sequelize: Sequelize,
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
    //TODO: Закешировать этот ответ
    const result = await this.sequelize.transaction(async (transaction) => {
      const statistic = await this.statisticRepo.findOne({
        where: { userId },
        transaction,
      })
      const knownNormal =
        await this.sessionsService.getNormalKnownSessionForStreak(
          userId,
          transaction,
        )
      const knownReverse =
        await this.sessionsService.getReverseKnownSessionForStrek(
          userId,
          transaction,
        )
      const learnNormal =
        await this.categoriesService.getCategoriesNormalForStreak(
          userId,
          transaction,
        )
      const learnReverse =
        await this.categoriesService.getCategoriesReverseForStreak(
          userId,
          transaction,
        )
      const repeatNormal = await this.repeatsService.getRepeatNormalForStreak(
        userId,
        transaction,
      )
      const repeatReverse = await this.repeatsService.getRepeatReverseForStreak(
        userId,
        transaction,
      )

      return {
        statistic,
        knownNormal,
        knownReverse,
        learnNormal,
        learnReverse,
        repeatNormal,
        repeatReverse,
      }
    })
    return result
  }
}
