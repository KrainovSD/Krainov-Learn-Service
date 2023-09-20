import { ApiProperty } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, IsString, Length, Matches, IsEmail } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({
    example: 'Денис',
    description: 'Имя пользователя',
    required: true,
  })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(2, 15, {
    message: 'Длина должна быть не менее 2 и не более 15 символов',
  })
  @Matches(/^([A-Za-zА-Яа-я]+)$/, {
    message: 'Должно состоять из букв русского или латинского алфавита',
  })
  readonly userName!: string

  @ApiProperty({
    example: 'Krainov',
    description: 'Псевдоним пользователя',
    required: true,
  })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(3, 16, {
    message: 'Длина должна быть не менее 3 и не более 16 символов',
  })
  @Matches(/^([A-Za-z0-9_]+)$/, {
    message:
      'Должно состоять из букв латинского алфавита, цифр или нижнего подчеркивания',
  })
  readonly nickName!: string

  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Aдрес электронной почты',
    required: true,
  })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsEmail({}, { message: 'Некорректный формат' })
  readonly email!: string

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
