import { ApiProperty } from '@nestjs/swagger'
import { ValidateNested, IsArray, IsNotEmpty, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { KnownsDto } from './knowns-dto'

export class CreateKnownsDto {
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
    type: () => KnownsDto,
  })
  @IsArray({ message: 'Должно быть массивом слов' })
  @ValidateNested({ each: true, message: 'Неверный формат слов' })
  @Type(() => KnownsDto)
  words!: KnownsDto[]
}
