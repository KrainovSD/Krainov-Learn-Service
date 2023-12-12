import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common'
import { API_VERSION } from '../const'
import { LearnsService } from './learns.service'
import { AuthGuard } from '../utils/guards/auth.guard'
import { CreateLearnDto } from './dto/create-learns-dto'
import { UpdateLearnsDto } from './dto/update-learns.dto'
import { DeleteLearnsDto } from './dto/delete-learns-dto'
import { ApiTags } from '@nestjs/swagger'
import { TraceId, UserId } from '../utils'

@ApiTags('Слова на изучении')
@Controller(`${API_VERSION.v1}/words/learns`)
export class LearnsController {
  constructor(private readonly learnsService: LearnsService) {}

  @UseGuards(AuthGuard)
  @Post('')
  createLearn(
    @Body() dto: CreateLearnDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.learnsService.createLearn(dto, userId, traceId)
  }

  @UseGuards(AuthGuard)
  @Put('')
  updateLearn(
    @Body() dto: UpdateLearnsDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.learnsService.updateLearn(dto, userId, traceId)
  }

  @UseGuards(AuthGuard)
  @Post('/delete')
  deleteLearn(
    @Body() dto: DeleteLearnsDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.learnsService.deleteLearn(
      dto.ids,
      dto.categoryId,
      userId,
      traceId,
    )
  }

  @UseGuards(AuthGuard)
  @Get('')
  getAllLearns(@UserId() userId: string, @TraceId() traceId: string) {
    return this.learnsService.getAllLearns(userId, traceId)
  }
}
