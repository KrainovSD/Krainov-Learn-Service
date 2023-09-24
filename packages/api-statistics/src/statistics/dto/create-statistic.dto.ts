import { IsString, IsUUID } from 'class-validator'

export class CreateStatisticDto {
  @IsUUID('4', { message: 'Должно быть в формате UUID' })
  userId!: string

  @IsString()
  test!: string
}
