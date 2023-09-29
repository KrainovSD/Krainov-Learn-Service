import { AuthGuard, TraceId, UserId } from 'src/utils'
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
  @UseGuards(AuthGuard({ roles: 'admin' }))
  createRepeat(@Body() dto: CreateRepeatDto, @TraceId() traceId: string) {
    return this.repeatService.createRepeat(dto.words, dto.userId, traceId)
  }

  @Get('')
  @UseGuards(AuthGuard)
  getAllRepeat(@UserId() userId: string, @TraceId() traceId: string) {
    return this.repeatService.getAllRepeats(userId, traceId)
  }

  @Post('/delete')
  @UseGuards(AuthGuard)
  deleteRepeat(
    @Body() dto: RepeatMultipleIdDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.repeatService.deleteRepeat(dto.ids, userId, traceId)
  }
}
