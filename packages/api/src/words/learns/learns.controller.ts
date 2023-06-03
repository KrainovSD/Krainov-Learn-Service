import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { API_VERSION } from 'src/const'
import { LearnsService } from './learns.service'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { CreateLearnDto } from './dto/create-learns-dto'
import { TRequest } from 'src/auth/auth.service'

@Controller(`${API_VERSION.v1}/words/learns`)
export class LearnsController {
  constructor(private readonly learnsService: LearnsService) {}

  @UseGuards(AuthGuard)
  @Post('')
  createLearn(@Body() dto: CreateLearnDto, @Req() request: TRequest) {
    return this.learnsService.createLearn(dto, request.user.id)
  }

  @UseGuards(AuthGuard)
  @Get('')
  getAllLearns(@Req() request: TRequest) {
    return this.learnsService.getAllLearns(request.user.id)
  }
}
