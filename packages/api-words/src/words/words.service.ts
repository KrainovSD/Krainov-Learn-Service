import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { CategoriesService } from 'src/categories/categories.service'
import { ClientService } from 'src/clients/client.service'
import { ERROR_MESSAGES } from 'src/const'
import { KnownsService } from 'src/knowns/knowns.service'
import { LearnsService } from 'src/learns/learns.service'
import { RelevancesService } from 'src/relevances/relevances.service'
import { RepeatDto } from 'src/repeats/dto/repeat-dto'
import { RepeatsService } from 'src/repeats/repeats.service'
import { SessionsService } from 'src/sessions/sessions.service'

type CheckHasWordsOptions = {
  currentWord: string
  id?: string
  userId: string
  type: 'known' | 'learn' | 'relevance'
  traceId: string
  learnForce?: boolean
}

@Injectable()
export class WordsService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly learnsService: LearnsService,
    private readonly knownsService: KnownsService,
    private readonly repeatsService: RepeatsService,
    private readonly relevancesService: RelevancesService,
    private readonly sessionsService: SessionsService,
    private readonly clientService: ClientService,
  ) {}

  async checkStreak(userId: string, traceId: string) {
    const knownNormal =
      this.sessionsService.getNormalKnownSessionForStreak(userId)
    const knownReverse =
      this.sessionsService.getReverseKnownSessionForStrek(userId)
    const learnNormal =
      this.categoriesService.getCategoriesForNormalSession(userId)
    const learnReverse =
      this.categoriesService.getCategoriesForReverseSession(userId)
    const repeatNormal = this.repeatsService.getRepeatForNormalSession(
      userId,
      traceId,
    )
    const repeatReverse = this.repeatsService.getRepeatForReverseSession(
      userId,
      traceId,
    )

    const result = await Promise.all([
      knownNormal,
      knownReverse,
      learnNormal,
      learnReverse,
      repeatNormal,
      repeatReverse,
    ])
    const streakInfo = {
      knownNormal: result[0].length > 0,
      knownReverse: result[1].length > 0,
      learnNormal: result[2].length === 0,
      learnReverse: result[3].length === 0,
      repeatNormal: result[4].length === 0,
      repeatReverse: result[5].length === 0,
    }

    return streakInfo
  }
  async registerStreak(userId: string, traceId: string) {
    return true
  }
  async completeCategory(
    completedCategoryInfo: Map<string, Date>,
    userId: string,
    traceId: string,
  ) {
    const categoryIds = [...completedCategoryInfo.keys()]

    const completedWords = (
      await this.learnsService.getAllLearnsByCategoryIds(categoryIds)
    ).map((word) => {
      return {
        ...word,
        dateStartLearn:
          completedCategoryInfo.get(word.categoryId) ?? new Date(),
      }
    })
    await this.knownsService.createKnown(completedWords, userId, traceId)
    await this.categoriesService.deleteCategory(categoryIds, userId, traceId)
  }
  async getAllSimilarWords(
    words: string | string[],
    userId: string,
    traceId: string,
  ) {
    const similarKnowns = new Set<string>()
    const similarLearns = new Set<string>()
    const similarRelevances = new Set<string>()

    const knownWords = this.knownsService.getAllKnownsByWordAndUserId(
      words,
      userId,
    )
    const learnWords = this.learnsService.getAllLearnsByWordAndUserId(
      words,
      userId,
    )
    const relevanceWords =
      this.relevancesService.getAllRelevancesByWordAndUserId(words, userId)

    const similarWords = await Promise.all([
      knownWords,
      learnWords,
      relevanceWords,
    ])

    similarWords.forEach((wordsArr, index) => {
      wordsArr.forEach((word) => {
        switch (index) {
          case 0: {
            similarKnowns.add(word.word)
            break
          }
          case 1: {
            similarLearns.add(word.word)
            break
          }
          case 2: {
            similarRelevances.add(word.word)
            break
          }
        }
      })
    })

    return { similarKnowns, similarLearns, similarRelevances }
  }
  async checkHasWord({
    currentWord,
    traceId,
    type,
    userId,
    id = undefined,
    learnForce,
  }: CheckHasWordsOptions) {
    const knownWords = this.knownsService.getKnownByWordAndUserId(
      currentWord,
      userId,
    )
    const learnWords = this.learnsService.getLearnByWordAndUserId(
      currentWord,
      userId,
    )
    const relevanceWords = this.relevancesService.getRelevanceByWordAndUserId(
      currentWord,
      userId,
    )
    const words = await Promise.all([knownWords, learnWords, relevanceWords])

    // if known update word has the same id not error
    const conditionKnownError = (wordId: string | undefined) =>
      Boolean(
        (wordId && wordId !== id && type === 'known') ||
          (wordId && type !== 'known'),
      )

    // if learn update word has the same id not error, but if create undefined !== wordId
    const conditionLearnError = (wordId: string | undefined) =>
      Boolean(
        (wordId && wordId !== id && type === 'learn') ||
          (wordId && type !== 'learn'),
      )

    words.forEach((word, index) => {
      switch (index) {
        case 0: {
          if (conditionKnownError(word?.id))
            throw new BadRequestException(ERROR_MESSAGES.hasWord)
          break
        }
        case 1: {
          if (conditionLearnError(word?.id))
            throw new BadRequestException(ERROR_MESSAGES.hasWord)
          break
        }
        case 2: {
          if (word && type === 'known')
            throw new BadRequestException(ERROR_MESSAGES.hasWord)
          if (word && type === 'learn' && !learnForce)
            throw new HttpException(
              ERROR_MESSAGES.hasRelevanceWord,
              HttpStatus.CONFLICT,
            )
          if (word && type === 'learn' && learnForce) {
            this.relevancesService.deleteRelevance([word.id], userId, traceId)
          }
          break
        }
      }
    })
  }
  async getAllSimilarWordsWithId(
    words: string[],
    userId: string,
    traceId: string,
  ) {
    const similarWords = new Map<string, string>()

    const similarKnowns = this.knownsService.getAllKnownsByWordAndUserId(
      words,
      userId,
    )
    const similarLearns = this.learnsService.getAllLearnsByWordAndUserId(
      words,
      userId,
    )
    const similarRelevances =
      this.relevancesService.getAllRelevancesByWordAndUserId(words, userId)

    const allSimilarWords = await Promise.all([
      similarKnowns,
      similarLearns,
      similarRelevances,
    ])

    allSimilarWords.forEach((wordArr) => {
      wordArr.forEach((similarWord) => {
        similarWords.set(similarWord.word, similarWord.id)
      })
    })

    return similarWords
  }
  async registerWordWithMistakes(
    word: RepeatDto,
    userId: string,
    traceId: string,
  ) {
    await this.repeatsService.createRepeat(
      [
        {
          word: word.word,
          transcription: word.transcription,
          translate: word.translate,
          description: word.description,
          example: word.example,
        },
      ],
      userId,
      traceId,
    )
  }
  async getUserSettings(
    userId: string,
    traceId: string,
  ): Promise<UserSettings> {
    //FIXME: Добавить обработку клиента
    return {} as any
  }
  async getWordsCategory(categoryId: string, userId: string, traceId: string) {
    const category = await this.categoriesService.getCategoryById(categoryId)
    if (!category || (category && category.userId !== userId))
      throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    return category
  }

  async getWordsCategoryIdsForSession(
    type: SessionType,
    userId: string,
    traceId: string,
  ) {
    const categories =
      type === 'normal'
        ? await this.categoriesService.getCategoriesForNormalSession(userId)
        : await this.categoriesService.getCategoriesForReverseSession(userId)

    return categories.map((category) => category.id)
  }
  async getKnownForSession(type: SessionType, userId: string, traceId: string) {
    return type === 'normal'
      ? await this.knownsService.getKnownForNormalSession(userId, traceId)
      : await this.knownsService.getKnownForReverseSession(userId, traceId)
  }
  async getLearnForSession(
    type: SessionType,
    userId: string,
    traceId: string,
    categoryId?: string[],
  ) {
    return type === 'normal'
      ? await this.learnsService.getLearnsForNormalSession(
          userId,
          traceId,
          categoryId,
        )
      : await this.learnsService.getLearnsForReverseSession(
          userId,
          traceId,
          categoryId,
        )
  }
  async getRepeatForSession(
    type: SessionType,
    userId: string,
    traceId: string,
  ) {
    return type === 'normal'
      ? await this.repeatsService.getRepeatForNormalSession(userId, traceId)
      : await this.repeatsService.getRepeatForReverseSession(userId, traceId)
  }

  async checkKnown(
    id: string,
    userId: string,
    option: string,
    type: SessionType,
    traceId: string,
  ) {
    return await this.knownsService.studyKnown(
      id,
      userId,
      option,
      type,
      traceId,
    )
  }
  async checkLearn(
    id: string,
    userId: string,
    option: string,
    type: SessionType,
    traceId: string,
  ) {
    return await this.learnsService.studyLearn(
      id,
      userId,
      option,
      type,
      traceId,
    )
  }
  async checkRepeat(
    id: string,
    userId: string,
    option: string,
    type: SessionType,
    traceId: string,
  ) {
    return await this.repeatsService.studyRepeat(
      id,
      userId,
      option,
      type,
      traceId,
    )
  }
  async checkCategory(
    ids: string[],
    userId: string,
    type: SessionType,
    traceId: string,
  ) {
    return await this.categoriesService.studyCategory(
      ids,
      userId,
      type,
      traceId,
    )
  }
}
