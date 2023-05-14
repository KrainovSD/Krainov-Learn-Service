import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Statistic } from './statistics.model'

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Statistic) private readonly statisticRepo: typeof Statistic,
  ) {}

  async createStatistic(userId: number) {
    const statistic = await this.statisticRepo.create({ userId })
    return statistic
  }
}
