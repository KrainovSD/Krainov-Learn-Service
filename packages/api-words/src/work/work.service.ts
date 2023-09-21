import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { CategoriesService } from '../categories/categories.service'
import { KnownsService } from '../knowns/knowns.service'
import { RepeatsService } from '../repeats/repeats.service'
import { LearnsService } from '../learns/learns.service'
import { JwtService } from '@nestjs/jwt'
import { StartWorkDto } from './dto/start.dto'
import { AuthWorkDto } from './dto/auth.dto'
import { Client } from './workGateway'
import { typings, utils, _, cache, CacheService } from 'src/utils/helpers'
import { WordsWorkDro } from './dto/words.dto'
import { RestoreWorkDto } from './dto/restore.dto'
import { SessionsService } from '../sessions/sessions.service'

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
    @Inject(cache.CACHE_PROVIDER_MODULE)
    private readonly cacheService: CacheService,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
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
  async handleDisconnect(client: Client) {
    const cache = await this.cacheService.get<CacheWords>(client.id)
    if (!cache) return
    cache.countConnection--
    await this.cacheService.set(client.id, cache)
  }

  async startSession(client: Client, payload: StartWorkDto) {
    client.id = `${client.user?.id}:${payload.type}:${payload.kind}`
    const cache = await this.cacheService.get<CacheWords>(client.id)

    if (cache) {
      await this.defineNextWord(client, cache)
      return
    }

    switch (payload.type) {
      case 'known': {
        const words = _.shuffle(
          payload.kind === 'normal'
            ? await this.knownsService.getKnownForNormalSession(
                client.user?.id!,
              )
            : await this.knownsService.getKnownForReverseSession(
                client.user?.id!,
              ),
        )

        await this.defineNextWord(client, cache, words)
        break
      }
      case 'learn': {
        const words = _.shuffle(
          payload.kind === 'normal'
            ? await this.learnsService.getLearnsForNormalSession(
                client.user?.id!,
              )
            : await this.learnsService.getLearnsForReverseSession(
                client.user?.id!,
              ),
        )
        await this.defineNextWord(client, cache, words)
        break
      }
      case 'repeat': {
        const words = _.shuffle(
          payload.kind === 'normal'
            ? await this.repeatsService.getRepeatForNormalSession(
                client.user?.id!,
              )
            : await this.repeatsService.getRepeatForReverseSession(
                client.user?.id!,
              ),
        )
        await this.defineNextWord(client, cache, words)
        break
      }
      case 'learnOff': {
        const words = _.shuffle(
          payload.kind === 'normal'
            ? await this.learnsService.getLearnsForNormalSession(
                client.user?.id!,
                payload.categories,
              )
            : await this.learnsService.getLearnsForReverseSession(
                client.user?.id!,
                payload.categories,
              ),
        )
        await this.defineNextWord(client, cache, words)
        break
      }
      default: {
        client.id = undefined
        this.sendTargetMessage(client, 'error', 'bad request')
        break
      }
    }
  }

  async checkWord(client: Client, payload: WordsWorkDro) {
    const { type, kind } = this.getOperationInfo(client)

    switch (type) {
      case 'known': {
        const result = await this.knownsService.studyKnown(
          payload.id,
          client.user?.id!,
          payload.option,
          kind as WorkKind,
        )
        await this.setWordCacheAfterCheck(client, result, payload.id)
        break
      }
      case 'learn': {
        const result = await this.learnsService.studyLearn(
          payload.id,
          client.user?.id!,
          payload.option,
          kind as WorkKind,
        )
        await this.setWordCacheAfterCheck(client, result, payload.id)
        break
      }
      case 'repeat': {
        const result = await this.repeatsService.studyRepeat(
          payload.id,
          client.user?.id!,
          payload.option,
          kind as WorkKind,
        )
        await this.setWordCacheAfterCheck(client, result, payload.id)
        break
      }
      case 'learnOff': {
        const cache = await this.cacheService.get<CacheWords>(client.id)
        if (!cache) throw new BadRequestException()

        const result =
          cache.words[cache.currentIndex][
            kind === 'normal' ? 'word' : 'translate'
          ] === payload.option
        await this.setWordCacheAfterCheck(client, result, payload.id)

        break
      }
      default: {
        client.id = undefined
        this.sendTargetMessage(client, 'error', 'bad request')
        break
      }
    }
  }
  private async setWordCacheAfterCheck(
    client: Client,
    result: boolean,
    id: string,
  ) {
    const cache = await this.cacheService.get<CacheWords>(client.id)
    if (!cache) throw new BadRequestException()

    if (!result) cache.errors.push(id)
    cache.currentIndex++

    await this.cacheService.set(client.id, cache)

    this.sendTargetMessage(client, 'answer', { result })
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
        this.sendTargetMessage(
          client,
          'restore',
          'do you want restore past session?',
        )
        return
      }
      await this.sendNextWord(client, cache, type, kind)
      return
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
      await this.sendNextWord(client, cache, type, kind)
      return
    }

    /* if nothing have */
    if (!cache) throw new BadRequestException()

    /* if work complete */
    if (cache.currentIndex > cache.maxLength) {
      await this.sendNextWord(client, cache, type, kind)
      return
    }

    /* if work continue */
    const options =
      kind === 'normal'
        ? undefined
        : await this.getRandomOptions(cache.words[cache.currentIndex].translate)
    cache.options = options
    await this.cacheService.set(client.id, cache)
    await this.sendNextWord(client, cache, type, kind)
  }
  private async sendNextWord(
    client: Client,
    cache: CacheWords,
    type: WorkType,
    kind: WorkKind,
  ) {
    /* if work complete */
    if (cache.currentIndex > cache.maxLength) {
      this.completeSession(client, cache, type, kind)
      return
    }

    /* if work continue */

    this.sendTargetMessage(client, 'words', {
      id: cache.words[cache.currentIndex].id,
      word:
        kind === 'normal'
          ? cache.words[cache.currentIndex].translate
          : cache.words[cache.currentIndex].word,
      options: cache.options,
    })
    return
  }

  async restoreSession(client: Client, dto: RestoreWorkDto) {
    const { type, kind } = this.getOperationInfo(client)

    if (dto.isRestore) {
      const cache = await this.cacheService.get<CacheWords>(client.id)
      if (!cache) throw new BadRequestException()
      cache.countConnection =
        cache.countConnection <= 0 ? 1 : cache.countConnection + 1
      await this.cacheService.set(client.id, cache)
      await this.startSession(client, { kind, type })
    } else {
      await this.cacheService.del(client.id)
      await this.startSession(client, { kind, type })
    }
  }

  async completeSession(
    client: Client,
    cache: CacheWords,
    type: WorkType,
    kind: WorkKind,
  ) {
    if (type !== 'learnOff' && client.user) {
      const errorCount = cache.errors.length
      await this.sessionsService.createSession(
        {
          kind,
          type,
          errorCount,
          successCount: cache.words.length - errorCount,
        },
        client.user.id,
      )
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
        categoryErrorNames = (
          await this.categoriesService.getCategoriesNameByIds([
            ...categoryErrorIds,
          ])
        ).map((word) => word.name)
      }
    }

    if (type === 'learn') {
      await this.categoriesService.studyCategory(
        [...categoryCompletedIds],
        client.user!.id,
        kind,
      )
    }

    await this.cacheService.del(`${client.user!.id}:streak`)

    const streakResult = await this.statisticsService.checkStreak(
      client.user!.id,
    )

    const answer = this.getFinallyAnswer(
      wordErrorNames,
      categoryErrorNames,
      type === 'learnOff' ? null : streakResult,
    )

    this.sendTargetMessage(client, 'complete', answer)
    await this.cacheService.del(client.id)
  }

  private getFinallyAnswer(
    wordError: string[],
    categoryError: string[],
    streakResult: StreakInfo | null,
  ) {
    let answer: string = 'Сессия завершена /n '
    if (streakResult && Object.values(streakResult).every((result) => result)) {
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
  private getOperationInfo(client: Client): { type: WorkType; kind: WorkKind } {
    if (!client.id)
      throw new BadRequestException(
        'Id пользователя при получении данных о сессии не обнаружено',
      )

    const id = client.id.split(':')
    const type = id[1]
    const kind = id[2]
    return { type: type as WorkType, kind: kind as WorkKind }
  }
}
