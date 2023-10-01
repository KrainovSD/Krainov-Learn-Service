import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class AuthWorkDto {
  @ApiProperty({
    example: '3850de1c-6b55-47e5-817f-bd02aaa69cf9',
    description: 'Токен авторизации',
    required: true,
  })
  @IsUUID('4', { message: 'Должно быть в формате UUID' })
  token!: string
}
