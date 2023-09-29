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
import { CRUDStatisticEventDto } from './dto/crud-statistic-event.dto'
import { TraceId, UserId } from 'src/utils'
import { RegisterStreakMessageDto } from './dto/register-streak-message.dto'

@ApiTags('Статистика')
@Controller(`${API_VERSION.v1}/statistics`)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @EventPattern('delete_statistics')
  delete(@Payload() dto: CRUDStatisticEventDto, @Ctx() context: RmqContext) {
    this.statisticsService.deleteStatistic(dto.data.userId, dto.traceId)
  }

  @EventPattern('create_statistics')
  create(@Payload() dto: CRUDStatisticEventDto, @Ctx() context: RmqContext) {
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
