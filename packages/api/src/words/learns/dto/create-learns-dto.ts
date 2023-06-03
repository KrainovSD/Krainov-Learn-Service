import { ApiProperty } from '@nestjs/swagger'
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator'

export class CreateLearnDto {
  @ApiProperty({
    example: 4,
    description: 'Уникальный идентификатор',
    required: true,
  })
  @IsNumber({}, { message: 'Неверный формат уникального идентификатора' })
  categoryId!: number

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

  @ApiProperty({
    example: 'Кот',
    description: 'Перевод',
  })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(1, 50, {
    message: 'Длина должна быть не более 50 символов',
  })
  @Matches(/^([а-яА-Я \-,]+)$/, {
    message: 'Должно состоять из букв русского алфавита, запятой или дефиса',
  })
  translate!: string

  @ApiProperty({
    example: '[kæt]',
    description: 'Транскрипция',
  })
  @ValidateIf((object, value) => value !== undefined)
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(1, 50, {
    message: 'Длина должна быть не более 50 символов',
  })
  @Matches(/^([ɑaʌəεæɜʒıɪŋɔɒʃðθʤʊbdefghijklmnprʧstuvwz[\] ˌˈ:ː.()ɡ]+)$/, {
    message: 'Должно состоять из специальных символов',
  })
  transcription!: string

  @ApiProperty({
    example:
      'a small animal with fur, four legs, and a tail that is kept as a pet',
    description: 'Описание',
  })
  @ValidateIf((object, value) => value !== undefined)
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(1, 164, {
    message: 'Длина должна быть не более 164 символов',
  })
  @Matches(/^([а-яА-Яa-zA-Z0-9 \-.,!?']+)$/, {
    message:
      'Должно состоять из букв русского и латинского алфавита, цифр, дефиса и знаков препинания',
  })
  description!: string

  @ApiProperty({
    example: ['A cat walks by and wakes up the tiger.'],
    description: 'Примеры',
  })
  @ValidateIf((object, value) => value !== undefined)
  @IsArray({ message: 'Должно быть массивом строковых значений' })
  @IsNotEmpty({ each: true, message: 'Не должно быть пустым' })
  @IsString({ each: true, message: 'Должно быть строкой' })
  @Length(1, 100, {
    each: true,
    message: 'Длина должна быть не более 164 символов',
  })
  @Matches(/^([a-zA-Z  \-.,!?']+)$/, {
    each: true,
    message:
      'Должно состоять из букв латинского алфавита, дефиса и знаков препинания!',
  })
  @ArrayMaxSize(3, { message: 'Количество примеров должно быть не более 3' })
  example!: string[]
}
