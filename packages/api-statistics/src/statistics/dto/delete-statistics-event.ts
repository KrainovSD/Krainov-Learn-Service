import { GetMessageDto } from '../../utils'
import { IsArray, IsUUID } from 'class-validator'

class DeleteStatistics {
  @IsArray()
  @IsUUID('4', { each: true, message: 'Должно быть в формате UUID' })
  userIds!: string
}

export class DeleteStatisticsDto extends GetMessageDto(DeleteStatistics) {}
