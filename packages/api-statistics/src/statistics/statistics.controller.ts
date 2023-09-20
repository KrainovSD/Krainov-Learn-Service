import { FastifyRequest } from 'fastify'
import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common'
import { API_VERSION } from 'src/const'
import { Role } from 'src/utils/decorators/role.decorator'
import { RoleGuard } from 'src/utils/guards/role.guard'
import { StatisticsService } from './statistics.service'
import { GetBestDto } from './dto/get-best-dto'
import { ApiTags } from '@nestjs/swagger'
import { MessagePattern } from '@nestjs/microservices'
import { AuthGuard } from 'src/utils/guards/auth.guard'

@ApiTags('Статистика')
@Controller(`${API_VERSION.v1}/statistics`)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @MessagePattern('create')
  create(userId: string) {
    return this.statisticsService.createStatistic(userId)
  }

  @Get()
  @UseGuards(AuthGuard)
  get(@Request() request: FastifyRequest) {
    return this.statisticsService.getStatisticByUserId(request.user.id)
  }

  @Get('/best')
  @Role('admin')
  @UseGuards(RoleGuard)
  checkStreak(@Query() dto: GetBestDto) {
    return this.statisticsService.checkStreak(dto.userId)
  }
}
