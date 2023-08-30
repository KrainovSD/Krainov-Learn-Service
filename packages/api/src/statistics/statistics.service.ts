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
import { CategoriesService } from 'src/words/categories/categories.service'
import { RepeatsService } from 'src/words/repeats/repeats.service'
import { SessionsService } from 'src/words/sessions/sessions.service'
import { CacheService } from 'src/cache/cache.service'

export type StreakInfo = {
  knownNormal: boolean
  knownReverse: boolean
  learnNormal: boolean
  learnReverse: boolean
  repeatNormal: boolean
  repeatReverse: boolean
}
@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Statistic) private readonly statisticRepo: typeof Statistic,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
    @Inject(forwardRef(() => RepeatsService))
    private readonly repeatsService: RepeatsService,
    private readonly sessionsService: SessionsService,
    private readonly cacheService: CacheService,
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
    let streakInfo: StreakInfo | null = await this.cacheService.get<StreakInfo>(
      `${userId}:streak`,
    )
    if (streakInfo) {
      return streakInfo
    }

    try {
      const statistic = this.statisticRepo.findOne({
        where: { userId },
      })
      const knownNormal =
        this.sessionsService.getNormalKnownSessionForStreak(userId)
      const knownReverse =
        this.sessionsService.getReverseKnownSessionForStrek(userId)
      const learnNormal =
        this.categoriesService.getCategoriesForNormalSession(userId)
      const learnReverse =
        this.categoriesService.getCategoriesForReverseSession(userId)
      const repeatNormal = this.repeatsService.getRepeatForNormalSession(userId)
      const repeatReverse =
        this.repeatsService.getRepeatForReverseSession(userId)

      const result = await Promise.all([
        statistic,
        knownNormal,
        knownReverse,
        learnNormal,
        learnReverse,
        repeatNormal,
        repeatReverse,
      ])
      streakInfo = {
        knownNormal: result[1].length > 0,
        knownReverse: result[2].length > 0,
        learnNormal: result[3].length === 0,
        learnReverse: result[4].length === 0,
        repeatNormal: result[5].length === 0,
        repeatReverse: result[6].length === 0,
      }
      await this.setStreak(streakInfo, result[0])
      await this.cacheService.set(`${userId}:streak`, streakInfo)
      return streakInfo
    } catch (error) {
      return null
    }
  }
  async setStreak(streakInfo: StreakInfo, statistic: Statistic | null) {
    if (!Object.values(streakInfo).every((result) => result)) {
      return
    }

    const { startNow } = utils.date.getToday()
    if (!statistic) throw new Error("couldn't set streak")

    if (statistic.lastStreakDate && statistic.lastStreakDate < startNow) {
      statistic.lastStreakDate = new Date()
      const isYesterdayStreak = utils.date.isYesterday(statistic.lastStreakDate)
      if (isYesterdayStreak) {
        statistic.currentStreak++
      } else {
        statistic.bestSteak =
          statistic.bestSteak < statistic.currentStreak
            ? statistic.currentStreak
            : statistic.bestSteak
        statistic.currentStreak = 1
      }
      await statistic.save()
      return
    }
  }
}
