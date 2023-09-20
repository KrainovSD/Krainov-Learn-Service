import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty } from 'class-validator'

export class RestoreWorkDto {
  @ApiProperty({
    example: false,
    description: 'Статус восстановления сессии',
    required: true,
  })
  @IsBoolean({ message: 'Должно быть логическим значением' })
  isRestore!: boolean
}
