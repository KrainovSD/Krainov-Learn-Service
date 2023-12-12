import { FastifyRequest } from 'fastify'
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { API_VERSION } from '../const'
import { CreateCategoryDto } from './dto/create-category-dto'
import { AuthGuard } from '../utils/guards/auth.guard'
import { UpdateCategoryDto } from './dto/update-category-dro'
import { CategoryIdDto } from './dto/category-id-dto'
import { CategoryMultipleIdDto } from './dto/category-multiple-id-dto'
import { ApiTags } from '@nestjs/swagger'
import { TraceId, UserId } from '../utils'

@ApiTags('Категории')
@Controller(`${API_VERSION.v1}/words/category`)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(AuthGuard)
  @Post('')
  createCategory(
    @Body() dto: CreateCategoryDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.categoriesService.createCategory(dto, userId, traceId)
  }

  @UseGuards(AuthGuard)
  @Put('')
  updateCategory(
    @Body() dto: UpdateCategoryDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.categoriesService.updateCategory(dto, userId, traceId)
  }

  @UseGuards(AuthGuard)
  @Post('/delete')
  deleteCategory(
    @Body() dto: CategoryMultipleIdDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.categoriesService.deleteCategory(dto.ids, userId, traceId)
  }

  @UseGuards(AuthGuard)
  @Get('')
  getAllCategories(@UserId() userId: string, @TraceId() traceId: string) {
    return this.categoriesService.getAllCategories(userId, traceId)
  }

  @UseGuards(AuthGuard)
  @Post('/start')
  startLearnCategory(
    @Body() dto: CategoryIdDto,
    @UserId() userId: string,
    @TraceId() traceId: string,
  ) {
    return this.categoriesService.startLearnCategory(dto, userId, traceId)
  }
}
