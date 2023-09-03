import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { API_VERSION, SWAGGER_DESCRIPTION } from 'src/const'
import { RelevancesService } from './relevances.service'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { TRequest } from 'src/auth/auth.service'
import { CreateRelevanceDto } from './dto/create-relevance-dto'
import { RelevanceMultipleIdDto } from './dto/relevance-multiple-id-dto'
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { SuccessEntity } from 'src/utils/entities/success.entity'
import { Relevance } from './relevances.model'
import { UnauthorizedEntity } from 'src/utils/entities/unauthorized.entity'
import { BadRequestEntity } from 'src/utils/entities/bad-request.entity'

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
  @ApiOkResponse({ type: [Relevance] })
  @UseGuards(AuthGuard)
  getAllRelevance(@Request() request: TRequest) {
    return this.relevanceService.getAllRelevances(request.user.id)
  }
}
