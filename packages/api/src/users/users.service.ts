import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { User, UserCreationArgs } from './users.model'
import { Op } from 'sequelize'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userRepo: typeof User) {}

  async createUser(dto: UserCreationArgs) {
    const user = await this.userRepo.create(dto)
    return user
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email } })
    return user
  }

  async getUserByNickName(nickName: string) {
    const user = await this.userRepo.findOne({ where: { nickName } })
    return user
  }

  async getUserById(id: number) {
    const user = await this.userRepo.findByPk(id)
    return user
  }

  async getUserByEmailChangeKey(key: string) {
    const user = await this.userRepo.findOne({ where: { emailChangeKey: key } })
    return user
  }

  async getUserByPasswordChangeKey(key: string) {
    const user = await this.userRepo.findOne({
      where: { passwordChangeKey: key },
    })
    return user
  }

  async getUserByEmailOrNickName(login: string) {
    const user = await this.userRepo.findOne({
      where: {
        [Op.or]: [
          {
            email: login.toLowerCase(),
          },
          {
            nickName: login,
          },
        ],
      },
    })
    return user
  }

  async getUserByTokenAndId(token: string, id: number) {
    const user = await this.userRepo.findOne({
      where: {
        [Op.and]: [{ token }, { id }],
      },
    })
    return user
  }

  async deleteUserById(id: number) {
    const user = await this.userRepo.destroy({ where: { id } })
    return user
  }
}
