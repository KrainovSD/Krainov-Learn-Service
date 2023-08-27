import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateStatisticDto {
  @ApiProperty({
    example: 10,
    description:
      'Лучший результат по количеству дней повторения необходимых слов подряд',
  })
  @IsOptional()
  @IsInt({ message: 'Должно быть числом' })
  bestSteak!: number | null

  @ApiProperty({
    example: 10,
    description:
      'Текущий результат по количеству дней повторения необходимых слов подряд',
  })
  @IsOptional()
  @IsInt({ message: 'Должно быть числом' })
  currentStreak!: number | null

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата последнего повторения необходимых слов',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  lastStreakDate!: Date | null
}
