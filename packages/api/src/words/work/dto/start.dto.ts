import { ApiProperty } from '@nestjs/swagger'
import {
  IsIn,
  IsNotEmpty,
  IsString,
  ValidateIf,
  IsArray,
  ArrayMinSize,
} from 'class-validator'

export const workTypeList = ['known', 'repeat', 'learn', 'learnOff']
export const workKindList = ['normal', 'reverse']

export class StartWorkDro {
  @ApiProperty({
    example: 'known',
    description: 'Тип обучения',
    required: true,
  })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  @IsIn(workTypeList, {
    message: 'Должно быть одним из доступных значений',
  })
  type!: 'known' | 'repeat' | 'learn' | 'learnOff'

  @ApiProperty({
    example: 'normar',
    description: 'Вид обучения',
    required: true,
  })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  @IsIn(workKindList, {
    message: 'Должно быть одним из доступных значений',
  })
  kind!: 'normal' | 'reverse'

  @ApiProperty({
    example: ['3850de1c-6b55-47e5-817f-bd02aaa69cf9'],
    description: 'Список уникальных идентификаторов категорий',
    required: false,
  })
  @ValidateIf((object, value) => {
    return object.type === 'learnOff'
  })
  @IsArray({ message: 'Должно быть массивом строк' })
  @ArrayMinSize(1, {
    message: 'Количество идентификаторов должно быть не менее одного',
  })
  @IsNotEmpty({ each: true, message: 'Не должно быть пустым' })
  @IsString({ each: true, message: 'Должно быть строкой' })
  categories!: string[]
}
