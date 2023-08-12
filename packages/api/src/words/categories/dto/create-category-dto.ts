import { ApiProperty } from '@nestjs/swagger'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator'

export class CreateCategoryDto {
  @ApiProperty({
    example: 'animals',
    description: 'Название категории',
    required: true,
  })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(4, 20, {
    message: 'Длина должна быть не менее 4 и не более 20 символов',
  })
  @Matches(/^([A-Za-zА-Яа-я0-9_]+)$/, {
    message:
      'Должно состоять из букв русского или латинского алфавита, цифр или нижнего подчеркивания',
  })
  name!: string

  @ApiProperty({
    example: 'icon.png',
    description: 'Название иконки',
    required: true,
  })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(1, 20, {
    message: 'Длина должна быть не менее 1 и не более 20 символов',
  })
  icon!: string

  @ApiProperty({
    example: [2, 2, 2, 2, 4, 4, 4, 4, 8, 8, 16, 16],
    description:
      'Регулярность повторения слов с ошибками (интервал между повторениями)',
    required: false,
    type: [Number],
  })
  @IsArray({ message: 'Должно быть массивом целых чисел' })
  @IsInt({ each: true, message: 'Должно быть целым числом' })
  @Min(1, {
    each: true,
    message: 'Числа должны быть не менее 1 и не более 16',
  })
  @Max(16, {
    each: true,
    message: 'Числа должны быть не менее 1 и не более 16',
  })
  @ArrayMinSize(12, { message: 'Количество повторений должно быть ровно 12' })
  @ArrayMaxSize(12, { message: 'Количество повторений должно быть ровно 12' })
  repeatRegularity!: number[]
}
