import { FastifyRequest } from 'fastify'
import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common'
import { API_VERSION } from 'src/const'
import { StatisticsService } from './statistics.service'
import { GetBestDto } from './dto/get-best-dto'
import { ApiTags } from '@nestjs/swagger'
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices'
import { AuthGuard } from 'src/utils/guards/auth.guard'

@ApiTags('Статистика')
@Controller(`${API_VERSION.v1}/statistics`)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @EventPattern('delete_statistics')
  delete(@Payload() userId: string, @Ctx() context: RmqContext) {
    this.statisticsService.deleteStatistic(userId)
  }

  @EventPattern('create_statistics')
  create(@Payload() userId: string, @Ctx() context: RmqContext) {
    console.log(context.getPattern())
    console.log(context.getArgs())
    console.log(context.getChannelRef())
    console.log(context.getMessage())
    console.log(context.getPattern())
    console.log(context)
    console.log(userId)

    this.statisticsService.createStatistic(userId)
  }

  @Get()
  @UseGuards(AuthGuard())
  get(@Request() request: FastifyRequest) {
    return this.statisticsService.getStatisticByUserId(request.user.id)
  }

  @Get('/best')
  @UseGuards(AuthGuard())
  checkStreak(@Query() dto: GetBestDto) {
    return this.statisticsService.checkStreak(dto.userId)
  }
}
