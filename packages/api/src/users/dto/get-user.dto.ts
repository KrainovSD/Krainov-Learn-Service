import { ApiProperty } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'

export class GetUserDto {
  @ApiProperty({
    example: 4,
    description: 'Уникальный идентификатор пользователя',
    required: true,
  })
  @IsNumber({}, { message: 'Неверный формат уникального идентификатора' })
  id!: number
}
