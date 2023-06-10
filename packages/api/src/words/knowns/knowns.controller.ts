import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { KnownsService } from './knowns.service'
import { API_VERSION } from 'src/const'
import { Role } from 'src/utils/decorators/role.decorator'
import { RoleGuard } from 'src/utils/guards/role.guard'
import { CreateKnownsDto } from './dto/create-knowns-dto'

@Controller(`${API_VERSION.v1}/words/knowns`)
export class KnownsController {
  constructor(private readonly knownService: KnownsService) {}

  @Post('')
  @Role('admin')
  @UseGuards(RoleGuard)
  createKnown(@Body() dto: CreateKnownsDto) {
    return this.knownService.createKnown(dto)
  }
}
