import { WsException } from '@nestjs/websockets'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { CategoriesService } from '../categories/categories.service'
import { KnownsService } from '../knowns/knowns.service'
import { RepeatsService } from '../repeats/repeats.service'
import { LearnsService } from '../learns/learns.service'
import { JwtService } from '@nestjs/jwt'
import { StartWorkDto } from './dto/start.dto'
import { AuthWorkDto } from './dto/auth.dto'
import { typings, utils, _, cache, CacheService } from 'src/utils/helpers'
import { WordsWorkDro } from './dto/words.dto'
import { RestoreWorkDto } from './dto/restore.dto'
import { SessionsService } from '../sessions/sessions.service'
import { WordsService } from 'src/words/words.service'
import { ClientService } from 'src/clients/client.service'

type WordItem = {
  id: string
  word: string
  translate: string
  categoryId?: string
}

export type CacheWords = {
  words: WordItem[]
  options?: string[]
  errors: string[]
  currentIndex: number
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

@Injectable()
export class WorkService {
  clients = new Map<string, ClientInfo>()

  constructor(
    @Inject(cache.CACHE_PROVIDER_MODULE)
    private readonly cacheService: CacheService,
    private readonly wordsService: WordsService,
    private readonly clientsService: ClientService,
  ) {}

  private formateMessage(event: string, message: any) {
    if (!typings.isArray(message) && !typings.isObject(message)) {
      message = { message }
    }
    return {
      event,
      data: message,
    }
  }

  closeClientConnection(code: number, reason: string, client: Client) {
    client.close(code, reason)
  }
  // sendTargetMessage(client: Client, event: string, message: any) {
  //   if (!typings.isArray(message) && !typings.isObject(message)) {
  //     message = { message }
  //   }

  //   client.send(
  //     JSON.stringify({
  //       event,
  //       data: message,
  //     }),
  //   )
  // }
  async handleDisconnect(client: Client) {
    if (!client.id) return

    const cache = await this.cacheService.get<CacheWords>(client.id)
    if (!cache) return
    cache.countConnection--
    await this.cacheService.set(client.id, cache)
  }
  async getUserInfoFromClient(dto: AuthWorkDto, client: Client) {
    const authHeader = dto.token
    const user = await this.clientsService.getUserInfo(
      authHeader,
      client.traceId,
    )

    if (!user)
      throw new WsException({
        status: 1008,
        message: 'Required Authorization',
      })

    client.user = user
    return this.formateMessage('auth', 'success')
  }

  async startSession(client: Client, payload: StartWorkDto) {
    client.id = `${client.user?.id}:${payload.type}:${payload.kind}`
    const cache = await this.cacheService.get<CacheWords>(client.id)

    if (cache) {
      return await this.defineNextWord(client, cache)
    }

    switch (payload.type) {
      case 'known': {
        const words = _.shuffle(
          await this.wordsService.getKnownForSession(
            payload.kind,
            client.user!.id,
            client.traceId,
          ),
        )

        return await this.defineNextWord(client, cache, words)
      }
      case 'learn': {
        const words = _.shuffle(
          await this.wordsService.getLearnForSession(
            payload.kind,
            client.user!.id,
            client.traceId,
          ),
        )
        return this.defineNextWord(client, cache, words)
      }
      case 'repeat': {
        const words = _.shuffle(
          await this.wordsService.getRepeatForSession(
            payload.kind,
            client.user!.id,
            client.traceId,
          ),
        )
        return this.defineNextWord(client, cache, words)
      }
      case 'learnOff': {
        const words = _.shuffle(
          await this.wordsService.getLearnForSession(
            payload.kind,
            client.user!.id,
            client.traceId,
            payload.categories,
          ),
        )
        return this.defineNextWord(client, cache, words)
      }
      default: {
        throw new WsException({ message: 'bad request', status: 1011 })
      }
    }
  }

  async checkWord(client: Client, payload: WordsWorkDro) {
    const { type, kind } = this.getOperationInfo(client)

    switch (type) {
      case 'known': {
        const result = await this.wordsService.checkKnown(
          payload.id,
          client.user!.id,
          payload.option,
          kind,
          client.traceId,
        )
        return await this.setWordCacheAfterCheck(client, result, payload.id)
      }
      case 'learn': {
        const result = await this.wordsService.checkLearn(
          payload.id,
          client.user!.id,
          payload.option,
          kind,
          client.traceId,
        )
        return await this.setWordCacheAfterCheck(client, result, payload.id)
      }
      case 'repeat': {
        const result = await this.wordsService.checkRepeat(
          payload.id,
          client.user!.id,
          payload.option,
          kind,
          client.traceId,
        )
        return await this.setWordCacheAfterCheck(client, result, payload.id)
      }
      case 'learnOff': {
        const cache = await this.cacheService.get<CacheWords>(client.id)
        if (!cache)
          throw new WsException({ message: 'bad request', status: 1011 })

        const result =
          cache.words[cache.currentIndex][
            kind === 'normal' ? 'word' : 'translate'
          ] === payload.option
        return await this.setWordCacheAfterCheck(client, result, payload.id)
      }
      default: {
        throw new WsException({ message: 'bad request', status: 1011 })
      }
    }
  }
  private async setWordCacheAfterCheck(
    client: Client,
    result: boolean,
    id: string,
  ) {
    const cache = await this.cacheService.get<CacheWords>(client.id)
    if (!cache) throw new WsException({ message: 'bad request', status: 1011 })

    if (!result) cache.errors.push(id)
    cache.currentIndex++

    await this.cacheService.set(client.id, cache)

    return this.formateMessage('answer', { result })
  }

  async defineNextWord(
    client: Client,
    cache?: CacheWords | null,
    words?: WordItem[],
  ) {
    const { type, kind } = this.getOperationInfo(client)

    /* if restore session */
    if (cache) {
      if (cache.countConnection <= 0) {
        return this.formateMessage(
          'restore',
          'do you want restore past session?',
        )
      }
      return await this.sendNextWord(client, cache, type, kind)
    }

    cache = await this.cacheService.get<CacheWords>(client.id)

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
        currentIndex: 0,
        maxLength: words.length - 1,
        countConnection: 1,
      }
      await this.cacheService.set(client.id, cache)
      return await this.sendNextWord(client, cache, type, kind)
    }

    /* if nothing have */
    if (!cache) throw new WsException({ message: 'bad request', status: 1011 })

    /* if work complete */
    if (cache.currentIndex > cache.maxLength) {
      return await this.sendNextWord(client, cache, type, kind)
    }

    /* if work continue */
    const options =
      kind === 'normal'
        ? undefined
        : await this.getRandomOptions(cache.words[cache.currentIndex].translate)
    cache.options = options
    await this.cacheService.set(client.id, cache)
    return await this.sendNextWord(client, cache, type, kind)
  }
  private async sendNextWord(
    client: Client,
    cache: CacheWords,
    type: WorkType,
    kind: SessionType,
  ) {
    /* if work complete */
    if (cache.currentIndex > cache.maxLength) {
      return await this.completeSession(client, cache, type, kind)
    }

    /* if work continue */

    return this.formateMessage('words', {
      id: cache.words[cache.currentIndex].id,
      word:
        kind === 'normal'
          ? cache.words[cache.currentIndex].translate
          : cache.words[cache.currentIndex].word,
      options: cache.options,
    })
  }

  async restoreSession(client: Client, dto: RestoreWorkDto) {
    const { type, kind } = this.getOperationInfo(client)

    if (dto.isRestore) {
      const cache = await this.cacheService.get<CacheWords>(client.id)
      if (!cache)
        throw new WsException({ message: 'bad request', status: 1011 })
      cache.countConnection =
        cache.countConnection <= 0 ? 1 : cache.countConnection + 1
      await this.cacheService.set(client.id, cache)
      return await this.startSession(client, { kind, type })
    } else {
      await this.cacheService.del(client.id)
      return await this.startSession(client, { kind, type })
    }
  }

  async completeSession(
    client: Client,
    cache: CacheWords,
    type: WorkType,
    kind: SessionType,
  ) {
    if (type !== 'learnOff' && client.user) {
      const errorCount = cache.errors.length
      await this.wordsService.createSession({
        errorCount,
        kind,
        type,
        userId: client.user?.id!,
        successCount: cache.words.length - errorCount,
      })
    }

    const wordErrorNames: string[] = []
    const categoryCompletedIds: Set<string> = new Set()
    const categoryErrorIds: Set<string> = new Set()
    let categoryErrorNames: string[] = []

    if (cache.errors.length > 0) {
      for (const word of cache.words) {
        if (cache.errors.includes(word.id)) {
          wordErrorNames.push(word.word)
          if (word.categoryId) {
            categoryErrorIds.add(word.categoryId)
          }
        } else {
          if (word.categoryId) {
            categoryCompletedIds.add(word.categoryId)
          }
        }
      }
      if (type === 'learn' || type === 'learnOff') {
        categoryErrorNames = await this.wordsService.getCategoryNamesByIds(
          [...categoryErrorIds],
          client.traceId,
        )
      }
    }

    if (type === 'learn') {
      await this.wordsService.checkCategory(
        [...categoryCompletedIds],
        client.user!.id,
        kind,
        client.traceId,
      )
    }

    await this.cacheService.del(`${client.user!.id}:streak`)

    const streakResult = await this.wordsService.registerStreak(
      client.user!.id,
      client.traceId,
    )

    const answer = this.getFinallyAnswer(
      wordErrorNames,
      categoryErrorNames,
      type === 'learnOff' ? null : streakResult ?? false,
    )

    await this.cacheService.del(client.id)
    return this.formateMessage('complete', answer)
  }

  private getFinallyAnswer(
    wordError: string[],
    categoryError: string[],
    streakResult: boolean | null,
  ) {
    let answer: string = 'Сессия завершена /n '
    if (streakResult) {
      answer += 'Серия была увеличена /n '
      return answer
    }

    if (categoryError.length > 0) {
      answer += `В следющих категориях была допущена ошибка: ${categoryError.join(
        ',',
      )} /n `
    }
    if (wordError.length > 0) {
      answer += `В следующих словах была допущена ошибка: ${wordError.join(
        ',',
      )}`
    }
    return answer
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
  private getOperationInfo(client: Client): {
    type: WorkType
    kind: SessionType
  } {
    if (!client.id)
      throw new WsException({ message: 'bad request', status: 1011 })

    const id = client.id.split(':')
    const type = id[1]
    const kind = id[2]
    return { type: type as WorkType, kind: kind as SessionType }
  }
}
