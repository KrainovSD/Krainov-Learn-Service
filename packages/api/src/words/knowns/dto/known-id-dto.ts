import { ApiProperty } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'

export class KnownIdDto {
  @ApiProperty({
    example: 4,
    description: 'Уникальный идентификатор',
    required: true,
  })
  @IsNumber({}, { message: 'Неверный формат уникального идентификатора' })
  id!: number
}
