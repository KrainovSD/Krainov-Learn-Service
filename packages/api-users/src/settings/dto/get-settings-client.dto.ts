import { GetMessageDto } from '../../utils'
import { IsUUID } from 'class-validator'

class GetSettings {
  @IsUUID('4', { message: 'Должно быть в формате UUID' })
  userId!: string
}

export class GetSettingsClientDto extends GetMessageDto(GetSettings) {}
