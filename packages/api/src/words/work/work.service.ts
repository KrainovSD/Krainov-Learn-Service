import { Injectable } from '@nestjs/common'
import { CategoriesService } from '../categories/categories.service'
import { KnownsService } from '../knowns/knowns.service'
import { RepeatsService } from '../repeats/repeats.service'
import { LearnsService } from '../learns/learns.service'
import { JwtService } from '@nestjs/jwt'
import { StartWorkDro } from './dto/start.work.dto'

type WordList = {
  id: string
  word: string
  translate: string
}

type ClientInfo = {
  client: any
  id: string
  name: string
  workType: 'learn' | 'known' | 'repeat'
  categories?: string[]
  wordList: Map<string, WordList>
  unCompletedWords: string[]
  completedWords: string[]
  wordWithError: string[]
}

@Injectable()
export class WorkService {
  clients = new Map<string, ClientInfo>()

  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly knownsService: KnownsService,
    private readonly repeatsService: RepeatsService,
    private readonly leaarnsService: LearnsService,
    private readonly jwtService: JwtService,
  ) {}

  getUserInfoFromClient(client: any) {
    try {
      const authHeader = client?.req?.headers?.authorization
      if (!authHeader || typeof authHeader !== 'string') throw new Error()
      const authInfo = authHeader.split(' ')
      if (authInfo.length !== 2) throw new Error()
      const bearer = authInfo[0]
      const token = authInfo[1]
      if (bearer !== 'Bearer') throw new Error()
      const user = this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      })
      return user
    } catch (e) {
      return false
    }
  }
  closeClientConnection(code: number, reason: string, client: any) {
    client.close(code, reason)
  }
  sendTargetMessage(client: any, event: string, message: any) {
    client.send(
      JSON.stringify({
        event,
        data: message,
      }),
    )
  }
  async startWork(client: any, payload: StartWorkDro) {}
}
