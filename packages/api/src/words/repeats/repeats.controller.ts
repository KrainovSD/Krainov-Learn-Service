import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { RepeatsService } from './repeats.service'
import { Role } from 'src/utils/decorators/role.decorator'
import { RoleGuard } from 'src/utils/guards/role.guard'
import { CreateRepeatDto } from './dto/create-repeat-dto'

@Controller()
export class RepeatsController {
  constructor(private readonly repeatService: RepeatsService) {}

  @Post()
  @Role('admin')
  @UseGuards(RoleGuard)
  createRepeat(@Body() dto: CreateRepeatDto) {
    return this.repeatService.createRepeat(dto)
  }
}
