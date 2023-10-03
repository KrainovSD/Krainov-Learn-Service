import { ApiProperty } from '@nestjs/swagger'

export class StreakInfoDto {
  @ApiProperty({
    example: true,
    description: 'Статус прохождение нормального сеанса изученных слов',
    required: true,
  })
  knownNormal!: boolean
  @ApiProperty({
    example: true,
    description: 'Статус прохождение реверсивного сеанса изученных слов',
    required: true,
  })
  knownReverse!: boolean
  @ApiProperty({
    example: true,
    description: 'Статус прохождение нормального сеанса изучаемых слов',
    required: true,
  })
  learnNormal!: boolean
  @ApiProperty({
    example: true,
    description: 'Статус прохождение реверсивного сеанса изучаемых слов',
    required: true,
  })
  learnReverse!: boolean
  @ApiProperty({
    example: true,
    description: 'Статус прохождение нормального сеанса повторяемых слов',
    required: true,
  })
  repeatNormal!: boolean
  @ApiProperty({
    example: true,
    description: 'Статус прохождение реверсивного сеанса повторяемых слов',
    required: true,
  })
  repeatReverse!: boolean
}
