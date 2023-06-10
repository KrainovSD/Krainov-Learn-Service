import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { RepeatsService } from './repeats.service'
import { Role } from 'src/utils/decorators/role.decorator'
import { RoleGuard } from 'src/utils/guards/role.guard'
import { CreateRepeatDto } from './dto/create-repeat-dto'
import { API_VERSION } from 'src/const'

@Controller(`${API_VERSION.v1}/words/repeats`)
export class RepeatsController {
  constructor(private readonly repeatService: RepeatsService) {}

  @Post('')
  @Role('admin')
  @UseGuards(RoleGuard)
  createRepeat(@Body() dto: CreateRepeatDto) {
    return this.repeatService.createRepeat(dto)
  }
}
