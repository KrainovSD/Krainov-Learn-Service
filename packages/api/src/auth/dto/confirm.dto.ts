import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ConfirmDto {
  @ApiProperty({ example: '4212512', description: 'Уникальный ключ' })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  readonly key!: string
}
