import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsUUID } from 'class-validator'

export class DeleteUsersDto {
  @ApiProperty({
    example: ['3850de1c-6b55-47e5-817f-bd02aaa69cf9'],
    description: 'Уникальный идентификатор пользователя',
    required: true,
  })
  @IsArray({ message: 'Должно быть массивом' })
  @IsUUID('4', { each: true, message: 'Должно быть в формате UUID' })
  ids!: string[]
}
