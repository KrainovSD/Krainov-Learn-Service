import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsInt, IsNotEmpty, IsString } from 'class-validator'
import { workKindList, workTypeList } from 'src/work/dto/start.dto'

export class CreateSessionDto {
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
    example: 10,
    description: 'Количество правильных слов',
    required: true,
  })
  @IsInt({ message: 'Должно быть числом' })
  successCount!: number

  @ApiProperty({
    example: 10,
    description: 'Количество неправильных слов',
    required: true,
  })
  @IsInt({ message: 'Должно быть числом' })
  errorCount!: number
}
