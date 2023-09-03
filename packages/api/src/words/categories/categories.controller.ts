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
import { API_VERSION } from 'src/const'
import { CreateCategoryDto } from './dto/create-category-dto'
import { TRequest } from 'src/auth/auth.service'
import { AuthGuard } from 'src/utils/guards/auth.guard'
import { UpdateCategoryDto } from './dto/update-category-dro'
import { CategoryIdDto } from './dto/category-id-dto'
import { CategoryMultipleIdDto } from './dto/category-multiple-id-dto'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Категории')
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
  @Post('/delete')
  deleteCategory(@Body() dto: CategoryMultipleIdDto, @Req() request: TRequest) {
    return this.categoriesService.deleteCategory(dto.ids, request.user.id)
  }

  @UseGuards(AuthGuard)
  @Get('')
  getAllCategories(@Req() request: TRequest) {
    return this.categoriesService.getAllCategories(request.user.id)
  }

  @UseGuards(AuthGuard)
  @Post('/start')
  startLearnCategory(@Body() dto: CategoryIdDto, @Req() request: TRequest) {
    return this.categoriesService.startLearnCategory(dto, request.user.id)
  }
}
