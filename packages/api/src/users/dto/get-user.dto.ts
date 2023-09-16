import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class GetUserDto {
  @ApiProperty({
    example: '3850de1c-6b55-47e5-817f-bd02aaa69cf9',
    description: 'Уникальный идентификатор пользователя',
    required: true,
  })
  @IsUUID('4', { message: 'Должно быть в формате UUID' })
  id!: string
}
