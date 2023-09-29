import { Injectable } from '@nestjs/common'
import { CategoriesService } from 'src/categories/categories.service'
import { KnownsService } from 'src/knowns/knowns.service'
import { LearnsService } from 'src/learns/learns.service'
import { RelevancesService } from 'src/relevances/relevances.service'
import { RepeatsService } from 'src/repeats/repeats.service'
import { SessionsService } from 'src/sessions/sessions.service'

@Injectable()
export class WordsService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly learnsService: LearnsService,
    private readonly knownsService: KnownsService,
    private readonly repeatsService: RepeatsService,
    private readonly relevancesService: RelevancesService,
    private readonly sessionsService: SessionsService,
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
    const repeatNormal = this.repeatsService.getRepeatForNormalSession(userId)
    const repeatReverse = this.repeatsService.getRepeatForReverseSession(userId)

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
    await this.knownsService.createKnown(completedWords, userId)
    await this.categoriesService.deleteCategory(categoryIds, userId, traceId)
  }
}
