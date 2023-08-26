import { BadRequestException, Injectable } from '@nestjs/common'
import { CategoriesService } from '../categories/categories.service'
import { KnownsService } from '../knowns/knowns.service'
import { RepeatsService } from '../repeats/repeats.service'
import { LearnsService } from '../learns/learns.service'
import { JwtService } from '@nestjs/jwt'
import { StartWorkDro } from './dto/start.dto'
import { AuthWorkDto } from './dto/auth.dto'
import { CacheService } from 'src/cache/cache.service'
import { UserInfo } from 'src/auth/auth.service'
import { Client } from './workGateway'
import { typings, utils, _ } from 'src/utils/helpers'
import { WordsWorkDro } from './dto/words.dto'

type WordItem = {
  id: string
  word: string
  translate: string
}

export type CacheWords = {
  words: WordItem[]
  options?: string[]
  errors: string[]
  lastCompleteIndex: number
  countConnection: number
  maxLength: number
}

type ClientInfo = {
  client: any
  id: string
  name: string
  workType: 'learn' | 'known' | 'repeat'
  categories?: string[]
  wordList: Map<string, WordItem>
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
  validateMessage(client: Client, dto: any, withId?: boolean) {
    if (!this.validateClient(client, withId)) {
      return false
    }

    if (!dto) {
      this.sendTargetMessage(client, 'bad_request', 'bad request')
      return false
    }
    return true
  }
  validateClient(client: Client, withId?: boolean) {
    if (!client.user) {
      this.closeClientConnection(1008, 'no auth', client)
      return false
    }
    if (withId && !client.user) {
      this.sendTargetMessage(client, 'bad_request', 'bad request')
      return false
    }
    return true
  }

  async startWork(client: Client, payload: StartWorkDro) {
    client.id = `${client.user?.id}:${payload.type}:${payload.kind}`
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
    const cache = await this.cacheService.get<CacheWords>(client.id!)

    if (cache) {
      await this.wordsNext(client, cache)
      return
    }

    const words =
      kind === 'normal'
        ? await this.knownsService.getKnownForNormalWork(client.user?.id!)
        : await this.knownsService.getKnownForReverseWork(client.user?.id!)

    await this.wordsNext(client, cache, words)
  }

  async wordsWork(client: Client, payload: WordsWorkDro) {
    const { type, kind } = this.getOperationInfo(client)

    switch (type) {
      case 'known': {
        const result = await this.knownsService.studyKnown(
          payload.id,
          client.user?.id!,
          payload.option,
          kind as WorkKind,
        )
        await this.wordCache(client, result, payload.id)
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
  private async wordCache(client: Client, result: boolean, id: string) {
    const cache = await this.cacheService.get<CacheWords>(client.id!)
    if (!cache) throw new BadRequestException()

    if (!result) cache.errors.push(id)
    cache.lastCompleteIndex++

    await this.cacheService.set(client.id!, cache)

    this.sendTargetMessage(client, 'answer', { result })
  }

  async wordsNext(
    client: Client,
    cache?: CacheWords | null,
    words?: WordItem[],
  ) {
    const { kind } = this.getOperationInfo(client)

    /* if restore session */
    if (cache) {
      if (cache.countConnection === 0) {
        //FIXME: Спросить хочет ли пользователь продолжать
        return
      }
      await this.sendNext(client, cache, kind)
      return
    }

    cache = await this.cacheService.get<CacheWords>(client.id!)

    /* If not cache and has words for start */
    if (!cache && words) {
      const options =
        kind === 'normal'
          ? undefined
          : await this.getRandomOptions(words[0].translate)

      const cache: CacheWords = {
        words,
        options,
        errors: [],
        lastCompleteIndex: 0,
        maxLength: words.length - 1,
        countConnection: 1,
      }
      await this.cacheService.set(client.id!, cache)

      await this.sendNext(client, cache, kind)
      return
    }

    /* if nothing have */
    if (!cache) throw new BadRequestException()

    /* if work continue */
    const options =
      kind === 'normal'
        ? undefined
        : await this.getRandomOptions(
            cache.words[cache.lastCompleteIndex].translate,
          )
    cache.options = options
    await this.cacheService.set(client.id!, cache)
    await this.sendNext(client, cache, kind)
  }
  private async sendNext(client: Client, cache: CacheWords, kind: WorkKind) {
    /* if work complete */
    if (cache.lastCompleteIndex > cache.maxLength) {
      //FIXME: Завершение
      await this.cacheService.del(client.id!)
      return
    }

    /* if work continue */

    this.sendTargetMessage(client, 'words', {
      id: cache.words[cache.lastCompleteIndex].id,
      word:
        kind === 'normal'
          ? cache.words[cache.lastCompleteIndex].translate
          : cache.words[cache.lastCompleteIndex].word,
      options: cache.options,
    })
    return
  }

  private async getRandomOptions(translate: string) {
    //FIXME: Создать базу слов, откуда цеплять варианты
    const optionList = [
      'слово',
      'кот',
      'машина',
      'комната',
      'взрыв',
      'кек',
      'поздравления',
    ]
    const result = [translate]
    while (result.length < 4) {
      result.push(this.getRandomOption(optionList, result))
    }
    return _.shuffle(result)
  }
  private getRandomOption(optionList: string[], options: string[]): string {
    const min = 0
    const max = optionList.length - 1
    const result = optionList[utils.common.getRandomNumber(min, max)]

    return options.includes(result)
      ? this.getRandomOption(optionList, options)
      : result
  }
  private getOperationInfo(client: Client): { type: WorkType; kind: WorkKind } {
    const id = client.id!.split(':')
    const type = id[1]
    const kind = id[2]
    return { type: type as WorkType, kind: kind as WorkKind }
  }
}
