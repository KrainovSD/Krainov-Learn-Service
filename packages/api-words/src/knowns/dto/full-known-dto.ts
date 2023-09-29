import { ApiProperty } from '@nestjs/swagger'
import { KnownsDto } from './knowns-dto'
import { IsNotEmpty, IsString } from 'class-validator'

export class FullKnownsDto extends KnownsDto {
  @ApiProperty({
    example: '3850de1c-6b55-47e5-817f-bd02aaa69cf9',
    description: 'Уникальный идентификатор',
    required: true,
  })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  id!: string
}
