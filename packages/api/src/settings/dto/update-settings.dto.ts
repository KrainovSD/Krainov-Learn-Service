import { ApiProperty } from '@nestjs/swagger'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  Max,
  Min,
  ValidateIf,
} from 'class-validator'

export class UpdateSettingsDto {
  @ApiProperty({
    example: 20,
    description: 'Количество изученных слов для одного повторения',
    required: false,
  })
  @ValidateIf((object, value) => value !== undefined)
  @IsInt({ message: 'Должно быть целым числом' })
  @Min(20, { message: 'Количество должно быть не менее 20 и не более 99' })
  @Max(99, { message: 'Количество должно быть не менее 20 и не более 99' })
  knownWordsCount!: number

  @ApiProperty({
    example: 3,
    description:
      'Количество допустимых в слове ошибок в течении всего времени для добавления на повторение',
    required: false,
  })
  @ValidateIf((object, value) => value !== undefined)
  @IsInt({ message: 'Должно быть целым числом' })
  @Min(3, { message: 'Количество должно быть не менее 3 и не более 9' })
  @Max(9, { message: 'Количество должно быть не менее 3 и не более 9' })
  mistakesInWordsCount!: number

  @ApiProperty({
    example: [2, 2, 2, 4, 4, 4, 8, 8],
    description:
      'Регулярность повторения слов с ошибками (интервал между повторениями)',
    required: false,
    type: [Number],
  })
  @ValidateIf((object, value) => value !== undefined)
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
  @ArrayMinSize(8, { message: 'Количество повторений должно быть ровно 8' })
  @ArrayMaxSize(8, { message: 'Количество повторений должно быть ровно 8' })
  repeatWordsRegularity!: number[]

  @ApiProperty({
    example: 45,
    description:
      'Промежуток дней, за который высчитывается количество встреч со словом',
    required: false,
  })
  @ValidateIf((object, value) => value !== undefined)
  @IsInt({ message: 'Должно быть целым числом' })
  @Min(10, { message: 'Количество должно быть не менее 10 и не более 90' })
  @Max(90, { message: 'Количество должно быть не менее 10 и не более 90' })
  relevanceObserveDay!: number

  @ApiProperty({
    example: 3,
    description:
      'Количество встреч со словом, которое высчитывается за промежуток дней',
    required: false,
  })
  @ValidateIf((object, value) => value !== undefined)
  @IsInt({ message: 'Должно быть целым числом' })
  @Min(3, { message: 'Количество должно быть не менее 3 и не более 9' })
  @Max(9, { message: 'Количество должно быть не менее 3 и не более 9' })
  relevanceObserveCount!: number
}
