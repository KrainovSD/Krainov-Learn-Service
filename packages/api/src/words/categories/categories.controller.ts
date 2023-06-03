import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { API_VERSION } from 'src/const'
import { CreateCategoryDto } from './dto/create-category-dto'
import { TRequest } from 'src/auth/auth.service'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { UpdateCategoryDto } from './dto/update-category-dro'
import { CategoryIdDto } from './dto/category-id-dto'

@Controller(`${API_VERSION.v1}/words/category`)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(AuthGuard)
  @Post('')
  createCategory(@Body() dto: CreateCategoryDto, @Req() request: TRequest) {
    return this.categoriesService.createCategory(dto, request.user.id)
  }

  @UseGuards(AuthGuard)
  @Put('')
  updateCategory(@Body() dto: UpdateCategoryDto, @Req() request: TRequest) {
    return this.categoriesService.updateCategory(dto, request.user.id)
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  deleteCategory(@Param() dto: CategoryIdDto, @Req() request: TRequest) {
    return this.categoriesService.deleteCategory(dto, request.user.id)
  }

  @UseGuards(AuthGuard)
  @Get('')
  getAllCategories(@Req() request: TRequest) {
    return this.categoriesService.getAllCategories(request.user.id)
  }
}
