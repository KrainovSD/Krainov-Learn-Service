import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { API_VERSION, SWAGGER_DESCRIPTION } from 'src/const'
import { StatisticsService } from './statistics.service'
import { GetBestDto } from './dto/get-best-dto'
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import {
  BadRequestEntity,
  TraceId,
  UnauthorizedEntity,
  UserId,
} from 'src/utils'
import { RegisterStreakMessageDto } from './dto/register-streak-message.dto'
import { CreateStatisticEventDto } from './dto/create-statistic-event.dto'
import { DeleteStatisticsDto } from './dto/delete-statistics-event'
import { Statistic } from './statistics.model'
import { StreakInfoDto } from './dto/streak-info.dto'

@ApiTags('Статистика')
@Controller(`${API_VERSION.v1}/statistics`)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @EventPattern('delete_statistics')
  async delete(@Payload() dto: DeleteStatisticsDto) {
    await this.statisticsService.deleteStatistics(dto.data.userIds, dto.traceId)
  }

  @EventPattern('create_statistics')
  async create(@Payload() dto: CreateStatisticEventDto) {
    await this.statisticsService.createStatistic(dto.data.userId, dto.traceId)
  }

  @MessagePattern('register_streak')
  registerStreak(@Payload() dto: RegisterStreakMessageDto) {
    const { userId, ...rest } = dto.data
    return this.statisticsService.registerStreak(rest, userId, dto.traceId)
  }

  @ApiOperation({
    summary: 'Получить информацию о статистике пользователя',
    description: '',
  })
  @ApiOkResponse({
    type: Statistic,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedEntity })
  @ApiBasicAuth()
  @Get()
  @UseGuards(AuthGuard())
  get(@UserId() userId: string, @TraceId() traceId: string) {
    return this.statisticsService.getStatisticByUserId(userId, traceId)
  }

  @ApiOperation({
    summary: 'Проверить статус выполнения повторений пользователя',
    description: '',
  })
  @ApiOkResponse({
    type: StreakInfoDto,
  })
  @ApiBadRequestResponse({
    type: BadRequestEntity,
    description: SWAGGER_DESCRIPTION.badRequest,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedEntity })
  @ApiBasicAuth()
  @Get('/best')
  @UseGuards(AuthGuard())
  checkStreak(@Query() dto: GetBestDto, @TraceId() traceId: string) {
    return this.statisticsService.checkStreak(dto.userId, traceId)
  }
}
