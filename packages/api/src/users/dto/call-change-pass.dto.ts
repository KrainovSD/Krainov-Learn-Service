import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class CallChangePassDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Aдрес электронной почты',
    required: true,
  })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsEmail({}, { message: 'Некорректный формат' })
  readonly email!: string
}
