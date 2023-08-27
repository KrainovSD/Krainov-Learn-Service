import { Injectable } from '@nestjs/common'
import { CreateSessionDto } from './dto/create-session.dto'
import { InjectModel } from '@nestjs/sequelize'
import { Sessions } from './sessions.model'
import { uuid } from 'src/utils/helpers'
import { RESPONSE_MESSAGES } from 'src/const'

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Sessions) private readonly sessionsRepo: typeof Sessions,
  ) {}

  async createSession(dto: CreateSessionDto, userId: string) {
    await this.sessionsRepo.create({ ...dto, userId, id: uuid() })
    return RESPONSE_MESSAGES.success
  }
}
