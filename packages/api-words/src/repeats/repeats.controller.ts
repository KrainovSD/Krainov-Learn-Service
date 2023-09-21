import { FastifyRequest } from 'fastify'
import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { RepeatsService } from './repeats.service'
import { CreateRepeatDto } from './dto/create-repeat-dto'
import { API_VERSION } from 'src/const'
import { RepeatMultipleIdDto } from './dto/repeat-multiple-id-dto'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Слова на повторении')
@Controller(`${API_VERSION.v1}/words/repeats`)
export class RepeatsController {
  constructor(private readonly repeatService: RepeatsService) {}

  @Post('')
  //@Role('admin')
  //@UseGuards(RoleGuard)
  createRepeat(@Body() dto: CreateRepeatDto) {
    return this.repeatService.createRepeat(dto.words, dto.userId)
  }

  @Get('')
  //@UseGuards(AuthGuard)
  getAllRepeat(@Request() request: FastifyRequest) {
    return this.repeatService.getAllRepeats(request.user.id)
  }

  @Post('/delete')
  //@UseGuards(AuthGuard)
  deleteRepeat(
    @Body() dto: RepeatMultipleIdDto,
    @Request() request: FastifyRequest,
  ) {
    return this.repeatService.deleteRepeat(dto.ids, request.user.id)
  }
}
