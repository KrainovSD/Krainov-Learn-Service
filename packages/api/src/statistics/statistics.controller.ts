import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { API_VERSION } from 'src/const'
import { Role } from 'src/utils/decorators/role.decorator'
import { RoleGuard } from 'src/utils/guards/role.guard'
import { StatisticsService } from './statistics.service'
import { GetBestDto } from './dto/get-best-dto'

@Controller(`${API_VERSION.v1}/statistics`)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('/best')
  @Role('admin')
  @UseGuards(RoleGuard)
  createKnown(@Query() dto: GetBestDto) {
    return this.statisticsService.checkStreak(dto.userId)
  }
}
