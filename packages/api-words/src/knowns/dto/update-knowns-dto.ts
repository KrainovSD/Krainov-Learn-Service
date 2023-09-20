import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNumber, ValidateNested } from 'class-validator'
import { KnownsDto } from './knowns-dto'
import { Type } from 'class-transformer'
import { FullKnownsDto } from './full-known-dto'

export class UpdateKnownsDto {
  @ApiProperty({
    example: [],
    description: 'Информация о словах',
    required: true,
  })
  @IsArray({ message: 'Должно быть массивом слов' })
  @ValidateNested({ each: true, message: 'Неверный формат слов' })
  @Type(() => FullKnownsDto)
  words!: FullKnownsDto[]
}
