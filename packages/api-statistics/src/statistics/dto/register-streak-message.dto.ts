import { GetMessageDto } from '../../utils'
import { IsBoolean, IsUUID } from 'class-validator'

class RegisterStreak {
  @IsUUID('4', { message: 'Должно быть в формате UUID' })
  userId!: string
  @IsBoolean()
  knownNormal!: boolean
  @IsBoolean()
  knownReverse!: boolean
  @IsBoolean()
  learnNormal!: boolean
  @IsBoolean()
  learnReverse!: boolean
  @IsBoolean()
  repeatNormal!: boolean
  @IsBoolean()
  repeatReverse!: boolean
}

export class RegisterStreakMessageDto extends GetMessageDto(RegisterStreak) {}
