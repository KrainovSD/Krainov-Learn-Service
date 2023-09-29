import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class ChangeEmailDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Aдрес электронной почты',
    required: true,
  })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsEmail({}, { message: 'Некорректный формат' })
  readonly email!: string

  @ApiProperty({
    example: '242452',
    description: 'Уникальный ключ',
    required: true,
  })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  readonly key!: string
}
