import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { API_VERSION } from 'src/const'
import { StatisticsService } from './statistics.service'
import { GetBestDto } from './dto/get-best-dto'
import { ApiTags } from '@nestjs/swagger'
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { nestUtils } from '../utils'

@ApiTags('Статистика')
@Controller(`${API_VERSION.v1}/statistics`)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @EventPattern('delete_statistics')
  delete(@Payload() userId: string, @Ctx() context: RmqContext) {
    this.statisticsService.deleteStatistic(userId)
  }

  @EventPattern('create_statistics')
  create(@Payload() dto: string, @Ctx() context: RmqContext) {
    return
    //this.statisticsService.createStatistic(userId)
  }

  @Get()
  @UseGuards(AuthGuard())
  get(@nestUtils.decorators.UserId() userId: string) {
    return this.statisticsService.getStatisticByUserId(userId)
  }

  @Get('/best')
  @UseGuards(AuthGuard())
  checkStreak(@Query() dto: GetBestDto) {
    return this.statisticsService.checkStreak(dto.userId)
  }
}
