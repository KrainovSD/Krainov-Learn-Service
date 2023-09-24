import { GetMessageDto } from '../../utils'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

class Auth {
  @IsNotEmpty({ message: 'Не должен быть пустым' })
  @IsString({ message: 'Должен быть строкой' })
  header!: string
}

export class AuthDto extends GetMessageDto(Auth) {}
