import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { RepeatDto } from './repeat-dto'
import { Type } from 'class-transformer'

export class CreateRepeatDto {
  @ApiProperty({
    example: '3850de1c-6b55-47e5-817f-bd02aaa69cf9',
    description: 'Уникальный идентификатор пользователя',
    required: true,
  })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  userId!: string

  @ApiProperty({
    example: [],
    description: 'Информация о словах',
    required: true,
  })
  @IsArray({ message: 'Должно быть массивом слов' })
  @ValidateNested({ each: true, message: 'test' })
  @Type(() => RepeatDto)
  words!: RepeatDto[]
}
