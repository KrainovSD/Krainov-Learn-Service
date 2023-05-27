import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator'

export class ChangeNickNameDto {
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
}
