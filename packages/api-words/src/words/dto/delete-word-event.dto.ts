import { GetMessageDto } from '../../utils'
import { IsArray, IsUUID } from 'class-validator'

class DeleteWords {
  @IsArray()
  @IsUUID('4', { each: true, message: 'Должно быть в формате UUID' })
  userIds!: string[]
}

export class DeleteWordsEventDto extends GetMessageDto(DeleteWords) {}
