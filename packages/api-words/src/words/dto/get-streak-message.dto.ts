import { GetMessageDto } from '../../utils'
import { IsUUID } from 'class-validator'

class GetStreak {
  @IsUUID('4', { message: 'Должно быть в формате UUID' })
  userId!: string
}

export class GetStreakMessageDto extends GetMessageDto(GetStreak) {}
