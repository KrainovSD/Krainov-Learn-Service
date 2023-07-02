import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsInt, ValidateNested } from 'class-validator'
import { KnownsDto } from './knowns-dto'
import { Type } from 'class-transformer'

export class CreateKnownsDto {
  @ApiProperty({
    example: 4,
    description: 'Уникальный идентификатор пользователя',
    required: true,
  })
  @IsInt({ message: 'Неверный формат уникального идентификатора' })
  userId!: number

  @ApiProperty({
    example: [],
    description: 'Информация о словах',
    required: true,
  })
  @IsArray({ message: 'Должно быть массивом слов' })
  @ValidateNested({ each: true, message: 'test' })
  @Type(() => KnownsDto)
  words!: KnownsDto[]
}
