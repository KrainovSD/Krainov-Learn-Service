import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsString } from 'class-validator'

export class RelevanceMultipleIdDto {
  @ApiProperty({
    example: ['3850de1c-6b55-47e5-817f-bd02aaa69cf9'],
    description: 'Уникальный идентификатор',
    required: true,
  })
  @IsArray({ message: 'Должно быть массивом целых чисел' })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  ids!: string[]
}
