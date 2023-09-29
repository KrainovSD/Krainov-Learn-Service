import { FastifyRequest } from 'fastify'
import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { API_VERSION, SWAGGER_DESCRIPTION } from 'src/const'
import { RelevancesService } from './relevances.service'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { CreateRelevanceDto } from './dto/create-relevance-dto'
import { RelevanceMultipleIdDto } from './dto/relevance-multiple-id-dto'
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Relevance } from './relevances.model'
import {
  BadRequestEntity,
  SuccessEntity,
  TraceId,
  UnauthorizedEntity,
  UserId,
} from '../utils'

@ApiTags('Актуализатор')
@Controller(`${API_VERSION.v1}/words/relevances`)
export class RelevancesController {
  constructor(private readonly relevanceService: RelevancesService) {}

  @Post('')
  @ApiOperation({
    summary: 'Добавить слова в актуализатор',
    description: '',
  })
  @ApiCreatedResponse({
    type: SuccessEntity,
    description: SWAGGER_DESCRIPTION.success('create'),
  })
  @ApiBadRequestResponse({
    type: BadRequestEntity,
    description: SWAGGER_DESCRIPTION.badRequest,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedEntity })
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  createRelevance(
    @Body() dto: CreateRelevanceDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.relevanceService.createRelevance(dto, userId, traceId)
  }

  @Post('/delete')
  @UseGuards(AuthGuard)
  deleteRelevance(
    @Body() dto: RelevanceMultipleIdDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.relevanceService.deleteRelevance(dto.ids, userId, traceId)
  }

  @Get()
  @ApiOkResponse({ type: [Relevance] })
  @UseGuards(AuthGuard)
  getAllRelevance(@UserId() userId: string, @TraceId() traceId: string) {
    return this.relevanceService.getAllRelevances(userId, traceId)
  }
}
