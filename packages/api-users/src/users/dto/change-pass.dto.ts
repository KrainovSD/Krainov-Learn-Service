import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'

export class ChangePassDto {
  @ApiProperty({
    example: '242452',
    description: 'Уникальный ключ',
    required: true,
  })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  readonly key!: string

  @ApiProperty({
    example: '123425',
    description: 'Пароль',
    required: true,
  })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(8, undefined, { message: 'Длина должна быть не менее 8 символов' })
  readonly password!: string
}
