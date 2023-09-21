import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Statistic } from './statistics.model'
import { CacheService, cache, utils, uuid } from 'src/utils/helpers'
import { UpdateStatisticDto } from './dto/update-statistic.dto'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { ClientService } from 'src/clients/client.service'

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
    @Inject(cache.CACHE_PROVIDER_MODULE)
    private readonly cacheService: CacheService,
    private readonly clientService: ClientService,
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
    let isDone = await this.cacheService.getBestStreak<
      Record<'result', boolean>
    >(userId)
    if (isDone) {
      console.log(isDone)
      return isDone.result
    }

    try {
      const statistic = await this.statisticRepo.findOne({
        where: { userId },
      })

      // const isDone =
      //   await this.clientService.sendMessageToMicroservice<boolean>(
      //     'words',
      //     'streak',
      //     userId,
      //   )
      const isDone = true

      // const knownNormal =
      //   this.sessionsService.getNormalKnownSessionForStreak(userId)
      // const knownReverse =
      //   this.sessionsService.getReverseKnownSessionForStrek(userId)
      // const learnNormal =
      //   this.categoriesService.getCategoriesForNormalSession(userId)
      // const learnReverse =
      //   this.categoriesService.getCategoriesForReverseSession(userId)
      // const repeatNormal = this.repeatsService.getRepeatForNormalSession(userId)
      // const repeatReverse =
      //   this.repeatsService.getRepeatForReverseSession(userId)

      // const result = await Promise.all([
      //   statistic,
      //   knownNormal,
      //   knownReverse,
      //   learnNormal,
      //   learnReverse,
      //   repeatNormal,
      //   repeatReverse,
      // ])

      if (isDone) await this.setStreak(statistic)
      await this.cacheService.setBestStreak(userId, { result: isDone })
      return isDone
    } catch (error) {
      return null
    }
  }
  async setStreak(statistic: Statistic | null) {
    const { startNow } = utils.date.getToday()
    if (!statistic) throw new Error("couldn't set streak")

    if (
      (statistic.lastStreakDate && statistic.lastStreakDate < startNow) ||
      !statistic.lastStreakDate
    ) {
      const isYesterdayStreak = utils.date.isYesterday(statistic.lastStreakDate)
      statistic.lastStreakDate = new Date()
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
