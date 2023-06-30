import { ApiProperty } from '@nestjs/swagger'
import { IsInt } from 'class-validator'

export class CategoryIdDto {
  @ApiProperty({
    example: 4,
    description: 'Уникальный идентификатор',
    required: true,
  })
  @IsInt({ message: 'Неверный формат уникального идентификатора' })
  id!: number
}
