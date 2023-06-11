import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator'

export class CreateRelevanceDto {
  @ApiProperty({
    example: 'cat',
    description: 'Слово на английском',
  })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(1, 50, {
    message: 'Длина должна быть не более 50 символов',
  })
  @Matches(/^([a-zA-Z\- ]+)$/, {
    message: 'Должно состоять из букв латинского алфавита, запятой или дефиса',
  })
  word!: string
}
