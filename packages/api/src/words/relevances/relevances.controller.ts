import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { API_VERSION } from 'src/const'
import { RelevancesService } from './relevances.service'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { TRequest } from 'src/auth/auth.service'
import { CreateRelevanceDto } from './dto/create-relevance-dto'
import { RelevanceMultipleIdDto } from './dto/relevance-multiple-id-dto'

@Controller(`${API_VERSION.v1}/words/relevances`)
export class RelevancesController {
  constructor(private readonly relevanceService: RelevancesService) {}

  @Post('')
  @UseGuards(AuthGuard)
  createRelevance(
    @Body() dto: CreateRelevanceDto,
    @Request() request: TRequest,
  ) {
    return this.relevanceService.createRelevance(dto, request.user.id)
  }

  @Post('/delete')
  @UseGuards(AuthGuard)
  deleteRelevance(
    @Body() dto: RelevanceMultipleIdDto,
    @Request() request: TRequest,
  ) {
    return this.relevanceService.deleteRelevance(dto.ids, request.user.id)
  }

  @Get()
  @UseGuards(AuthGuard)
  getAllRelevance(@Request() request: TRequest) {
    return this.relevanceService.getAllRelevance(request.user.id)
  }
}
