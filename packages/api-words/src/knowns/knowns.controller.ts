import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common'
import { KnownsService } from './knowns.service'
import { API_VERSION } from 'src/const'
import { CreateKnownsDto } from './dto/create-knowns-dto'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { KnownMultipleIdDto } from './dto/known-multiple-id-dto'
import { FullKnownsDto } from './dto/full-known-dto'
import { ApiTags } from '@nestjs/swagger'
import { TraceId, UserId } from '../utils'

@ApiTags('Выученные слова')
@Controller(`${API_VERSION.v1}/words/knowns`)
export class KnownsController {
  constructor(private readonly knownService: KnownsService) {}

  @Post('')
  @UseGuards(AuthGuard({ roles: 'admin' }))
  createKnown(@Body() dto: CreateKnownsDto, @TraceId() traceId: string) {
    return this.knownService.createKnown(dto.words, dto.userId, traceId)
  }

  @Get('')
  @UseGuards(AuthGuard)
  getAllKnown(@UserId() userId: string, @TraceId() traceId: string) {
    return this.knownService.getAllKnowns(userId, traceId)
  }

  @Post('/delete')
  @UseGuards(AuthGuard)
  deleteKnown(
    @Body() dto: KnownMultipleIdDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.knownService.deleteKnown(dto.ids, userId, traceId)
  }

  @Put('')
  @UseGuards(AuthGuard)
  updateKnown(
    @Body() dto: FullKnownsDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.knownService.updateKnown(dto, userId, traceId)
  }
}
