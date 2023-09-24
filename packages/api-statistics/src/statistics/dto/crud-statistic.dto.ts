import { GetMessageDto } from '../../utils'
import { IsUUID } from 'class-validator'

class CRUDStatistic {
  @IsUUID('4', { message: 'Должно быть в формате UUID' })
  userId!: string
}

export class CRUDStatisticDto extends GetMessageDto(CRUDStatistic) {}
