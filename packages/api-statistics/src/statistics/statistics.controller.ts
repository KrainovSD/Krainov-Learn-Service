import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { API_VERSION } from 'src/const'
import { StatisticsService } from './statistics.service'
import { GetBestDto } from './dto/get-best-dto'
import { ApiTags } from '@nestjs/swagger'
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { TraceId, UserId } from 'src/utils'
import { RegisterStreakMessageDto } from './dto/register-streak-message.dto'
import { CreateStatisticEventDto } from './dto/create-statistic-event.dto'
import { DeleteStatisticsDto } from './dto/delete-statistics-event'

@ApiTags('Статистика')
@Controller(`${API_VERSION.v1}/statistics`)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @EventPattern('delete_statistics')
  delete(@Payload() dto: DeleteStatisticsDto, @Ctx() context: RmqContext) {
    this.statisticsService.deleteStatistics(dto.data.userIds, dto.traceId)
  }

  @EventPattern('create_statistics')
  create(@Payload() dto: CreateStatisticEventDto, @Ctx() context: RmqContext) {
    this.statisticsService.createStatistic(dto.data.userId, dto.traceId)
  }

  @MessagePattern('register_streak')
  registerStreak(@Payload() dto: RegisterStreakMessageDto) {
    const { userId, ...rest } = dto.data
    return this.statisticsService.registerStreak(rest, userId, dto.traceId)
  }

  @Get()
  @UseGuards(AuthGuard())
  get(@UserId() userId: string, @TraceId() traceId: string) {
    return this.statisticsService.getStatisticByUserId(userId, traceId)
  }

  @Get('/best')
  @UseGuards(AuthGuard())
  checkStreak(@Query() dto: GetBestDto, @TraceId() traceId: string) {
    return this.statisticsService.checkStreak(dto.userId, traceId)
  }
}
