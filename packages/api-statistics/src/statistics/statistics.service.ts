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
import { ClientService, StreakInfo } from 'src/clients/client.service'

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
    if (!statistic) throw new BadRequestException(ERROR_MESSAGES.infoNotFound)

    utils.common.updateNewValue(statistic, dto)
    await statistic.save()
    return RESPONSE_MESSAGES.success
  }
  async deleteStatistic(userId: string) {
    return await this.statisticRepo.destroy({ where: { userId } })
  }

  async getStatisticByUserId(userId: string) {
    return await this.statisticRepo.findOne({
      where: {
        userId,
      },
    })
  }

  async checkStreak(userId: string) {
    let streakInfo = await this.cacheService.getBestStreak<StreakInfo>(userId)
    if (streakInfo) {
      return streakInfo
    }

    try {
      const statistic = await this.statisticRepo.findOne({
        where: { userId },
      })

      const streakInfo = await this.clientService.getStreakInfo(userId)
      if (!streakInfo) throw new Error()

      if (streakInfo.result) await this.setStreak(statistic)
      await this.cacheService.setBestStreak(userId, streakInfo)
      return streakInfo
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
