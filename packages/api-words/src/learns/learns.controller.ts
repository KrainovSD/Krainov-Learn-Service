import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import { API_VERSION } from 'src/const'
import { LearnsService } from './learns.service'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { CreateLearnDto } from './dto/create-learns-dto'
import { TRequest } from 'src/auth/auth.service'
import { UpdateLearnsDto } from './dto/update-learns.dto'
import { DeleteLearnsDto } from './dto/delete-learns-dto'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Слова на изучении')
@Controller(`${API_VERSION.v1}/words/learns`)
export class LearnsController {
  constructor(private readonly learnsService: LearnsService) {}

  @UseGuards(AuthGuard)
  @Post('')
  createLearn(@Body() dto: CreateLearnDto, @Req() request: TRequest) {
    return this.learnsService.createLearn(dto, request.user.id)
  }

  @UseGuards(AuthGuard)
  @Put('')
  updateLearn(@Body() dto: UpdateLearnsDto, @Req() request: TRequest) {
    return this.learnsService.updateLearn(dto, request.user.id)
  }

  @UseGuards(AuthGuard)
  @Post('/delete')
  deleteLearn(@Body() dto: DeleteLearnsDto, @Req() request: TRequest) {
    return this.learnsService.deleteLearn(
      dto.ids,
      dto.categoryId,
      request.user.id,
    )
  }

  @UseGuards(AuthGuard)
  @Get('')
  getAllLearns(@Req() request: TRequest) {
    return this.learnsService.getAllLearns(request.user.id)
  }
}
