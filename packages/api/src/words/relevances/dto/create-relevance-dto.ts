import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsString, Length, Matches } from 'class-validator'

export class CreateRelevanceDto {
  @ApiProperty({
    example: ['cat', 'dog', 'frog'],
    description: 'Слова на английском',
    minLength: 1,
    maxLength: 50,
    type: [String],
  })
  @IsArray({ message: 'Должно быть массивом слов' })
  @IsNotEmpty({ each: true, message: 'Не должно быть пустым' })
  @IsString({ each: true, message: 'Должно быть строкой' })
  @Length(1, 50, {
    each: true,
    message: 'Длина должна быть не более 50 символов',
  })
  @Matches(/^([a-zA-Z\- ]+)$/, {
    each: true,
    message: 'Должно состоять из букв латинского алфавита, запятой или дефиса',
  })
  words!: string[]
}
