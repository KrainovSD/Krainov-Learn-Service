import { Injectable } from '@nestjs/common'
import { CategoriesService } from '../categories/categories.service'
import { KnownsService } from '../knowns/knowns.service'
import { RepeatsService } from '../repeats/repeats.service'
import { LearnsService } from '../learns/learns.service'
import { JwtService } from '@nestjs/jwt'
import { StartWorkDro } from './dto/start.dto'
import { AuthWorkDto } from './dto/auth.dto'
import { typings } from '@krainov/utils'
import { CacheService } from 'src/cache/cache.service'
import { UserInfo } from 'src/auth/auth.service'
import { Client } from './workGateway'

type WordList = {
  id: string
  word: string
  translate: string
}

export type KnownCache = {
  words: WordList[]
  errors: string[]
  completeIndex: number
  countConnection: number
  maxLength: number
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

export type WorkKind = 'normal' | 'reverse'
export type WorkType = 'known' | 'repeat' | 'learn' | 'learnOff'

@Injectable()
export class WorkService {
  clients = new Map<string, ClientInfo>()

  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly knownsService: KnownsService,
    private readonly repeatsService: RepeatsService,
    private readonly learnsService: LearnsService,
    private readonly cacheService: CacheService,
    private readonly jwtService: JwtService,
  ) {}

  getUserInfoFromClient(dto: AuthWorkDto) {
    try {
      const authHeader = dto.token
      if (!authHeader || typeof authHeader !== 'string') throw new Error()
      const authInfo = authHeader.split(' ')
      if (authInfo.length !== 2) throw new Error()
      const bearer = authInfo[0]
      const token = authInfo[1]
      if (bearer !== 'Bearer') throw new Error()
      const user = this.jwtService.verify<UserInfo>(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      })
      this.cacheService.set(user.id, user.role)
      return user
    } catch (e) {
      return false
    }
  }
  closeClientConnection(code: number, reason: string, client: Client) {
    client.close(code, reason)
  }
  sendTargetMessage(client: Client, event: string, message: any) {
    if (!typings.isArray(message) && !typings.isObject(message)) {
      message = { message }
    }

    client.send(
      JSON.stringify({
        event,
        data: message,
      }),
    )
  }
  validateMessage(client: Client, dto: any) {
    if (!client.user) {
      this.closeClientConnection(1008, 'no auth', client)
      return false
    }
    if (!dto) {
      this.sendTargetMessage(client, 'bad_request', 'bad request')
      return false
    }
    return true
  }
  async startWork(client: Client, payload: StartWorkDro) {
    client.id = `${client.user?.id}:${payload.type}:${payload.kind}`
    client.type = payload.type
    client.kind = payload.kind
    switch (payload.type) {
      case 'known': {
        await this.startKnown(client, payload.kind)
        break
      }
      case 'learn': {
        break
      }
      case 'repeat': {
        break
      }
      case 'learnOff': {
        break
      }
      default: {
        client.id = undefined
        this.sendTargetMessage(client, 'error', 'bad request')
        break
      }
    }
  }
  private async startKnown(client: Client, kind: WorkKind) {
    try {
      const words =
        kind === 'normal'
          ? await this.knownsService.getKnownForNormalWork(client.user?.id!)
          : await this.knownsService.getKnownForReverseWork(client.user?.id!)

      const knownCache: KnownCache = {
        words,
        errors: [],
        completeIndex: 0,
        maxLength: words.length - 1,
        countConnection: 1,
      }
      this.cacheService.set(client.id!, knownCache)
      this.sendTargetMessage(client, 'words', {
        id: words[knownCache.completeIndex].id,

        word:
          kind === 'normal'
            ? words[knownCache.completeIndex].word
            : words[knownCache.completeIndex].translate,
        options: ['test', 'test1', 'test2', 'test3'],
      })
    } catch (error) {
      this.sendTargetMessage(client, 'error', error)
    }
  }
}
