import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { KnownIdDto } from './dto/known-id-dto'
import { UpdateKnownsDto } from './dto/update-knowns-dto'

@Controller(`${API_VERSION.v1}/words/knowns`)
export class KnownsController {
  constructor(private readonly knownService: KnownsService) {}

  @Post('')
  @Role('admin')
  @UseGuards(RoleGuard)
  createKnown(@Body() dto: CreateKnownsDto) {
    return this.knownService.createKnown(dto)
  }

  @Get('')
  @UseGuards(AuthGuard)
  getAllKnown(@Request() request: TRequest) {
    return this.knownService.getAllKnown(request.user.id)
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  deleteKnown(@Param() dto: KnownIdDto, @Request() request: TRequest) {
    return this.knownService.deleteKnown(dto, request.user.id)
  }

  @Put('')
  @UseGuards(AuthGuard)
  updateKnown(@Body() dto: UpdateKnownsDto, @Request() request: TRequest) {
    return this.knownService.updateKnown(dto, request.user.id)
  }
}
