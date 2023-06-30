import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsInt } from 'class-validator'

export class RepeatMultipleIdDto {
  @ApiProperty({
    example: [4],
    description: 'Уникальный идентификатор',
    required: true,
  })
  @IsArray({ message: 'Должно быть массивом целых чисел' })
  @IsInt({ each: true, message: 'Неверный формат уникального идентификатора' })
  ids!: number[]
}
