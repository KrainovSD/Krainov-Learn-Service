import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { RepeatsService } from './repeats.service'
import { Role } from 'src/utils/decorators/role.decorator'
import { RoleGuard } from 'src/utils/guards/role.guard'
import { CreateRepeatDto } from './dto/create-repeat-dto'
import { API_VERSION } from 'src/const'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { TRequest } from 'src/auth/auth.service'
import { RepeatMultipleIdDto } from './dto/repeat-multiple-id-dto'

@Controller(`${API_VERSION.v1}/words/repeats`)
export class RepeatsController {
  constructor(private readonly repeatService: RepeatsService) {}

  @Post('')
  @Role('admin')
  @UseGuards(RoleGuard)
  createRepeat(@Body() dto: CreateRepeatDto) {
    return this.repeatService.createRepeat(dto)
  }

  @Get('')
  @UseGuards(AuthGuard)
  getAllRepeat(@Request() request: TRequest) {
    return this.repeatService.getAllRepeat(request.user.id)
  }

  @Post('/delete')
  @UseGuards(AuthGuard)
  deleteRepeat(@Body() dto: RepeatMultipleIdDto, @Request() request: TRequest) {
    return this.repeatService.deleteRepeat(dto.ids, request.user.id)
  }
}
