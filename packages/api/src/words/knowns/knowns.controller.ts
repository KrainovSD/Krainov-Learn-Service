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
import { Role } from 'src/utils/decorators/role.decorator'
import { RoleGuard } from 'src/utils/guards/role.guard'
import { CreateKnownsDto } from './dto/create-knowns-dto'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { TRequest } from 'src/auth/auth.service'
import { UpdateKnownsDto } from './dto/update-knowns-dto'
import { KnownMultipleIdDto } from './dto/known-multiple-id-dto'

@Controller(`${API_VERSION.v1}/words/knowns`)
export class KnownsController {
  constructor(private readonly knownService: KnownsService) {}

  @Post('')
  @Role('admin')
  @UseGuards(RoleGuard)
  createKnown(@Body() dto: CreateKnownsDto) {
    return this.knownService.createKnown(dto.words, dto.userId)
  }

  @Get('')
  @UseGuards(AuthGuard)
  getAllKnown(@Request() request: TRequest) {
    return this.knownService.getAllKnowns(request.user.id)
  }

  @Post('/delete')
  @UseGuards(AuthGuard)
  deleteKnown(@Body() dto: KnownMultipleIdDto, @Request() request: TRequest) {
    return this.knownService.deleteKnown(dto.ids, request.user.id)
  }

  @Put('')
  @UseGuards(AuthGuard)
  updateKnown(@Body() dto: UpdateKnownsDto, @Request() request: TRequest) {
    return this.knownService.updateKnown(dto, request.user.id)
  }
}
