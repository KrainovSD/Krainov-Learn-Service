import { Injectable } from '@nestjs/common'
import { CreateSessionDto } from './dto/create-session.dto'
import { InjectModel } from '@nestjs/sequelize'
import { Sessions } from './sessions.model'
import { utils, uuid } from 'src/utils/helpers'
import { RESPONSE_MESSAGES } from 'src/const'
import { Op, Transaction } from 'sequelize'

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Sessions) private readonly sessionsRepo: typeof Sessions,
  ) {}

  async createSession(dto: CreateSessionDto, userId: string) {
    await this.sessionsRepo.create({
      ...dto,
      userId,
      id: uuid(),
      date: new Date(),
    })
    return RESPONSE_MESSAGES.success
  }

  async getNormalKnownSessionForStreak(
    userId: string,
    transaction: Transaction,
  ) {
    const { startNow, endNow } = utils.date.getToday()
    return await this.sessionsRepo.findAll({
      attributes: ['id'],
      where: {
        userId,
        type: 'known',
        kind: 'normal',
        date: {
          [Op.or]: [{ [Op.lte]: endNow }, { [Op.gte]: startNow }],
        },
      },
      transaction,
    })
  }
  async getReverseKnownSessionForStrek(
    userId: string,
    transaction: Transaction,
  ) {
    const { startNow, endNow } = utils.date.getToday()
    return await this.sessionsRepo.findAll({
      attributes: ['id'],
      where: {
        userId,
        type: 'known',
        kind: 'reverse',
        date: {
          [Op.or]: [{ [Op.lte]: endNow }, { [Op.gte]: startNow }],
        },
      },
      transaction,
    })
  }
}
