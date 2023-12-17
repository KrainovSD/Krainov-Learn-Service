import { Test } from '@nestjs/testing'
import { Provider } from '@nestjs/common'
import { ERROR_MESSAGES } from '../const'
import { utils } from '@krainov/kls-utils'
import { getModelToken } from '@nestjs/sequelize'
import { Category } from './categories.model'
import { WordsService } from '../words/words.service'
import { CategoriesService } from './categories.service'
import { CategoryIdDto } from './dto/category-id-dto'
import { ALLOW_WORDS_TO_START_CATEGORY } from './categories.constants'

describe('Categories Service', () => {
  let categoriesService: CategoriesService
  let wordsService: WordsService
  let model: typeof Category

  const wordsProvider: Provider = {
    provide: WordsService,
    useValue: {
      completeCategory: jest.fn(() => null),
    },
  }
  const repositoryProvider: Provider = {
    provide: getModelToken(Category),
    useValue: {
      create: jest.fn(() => null),
      findOne: jest.fn(() => null),
      destroy: jest.fn(() => null),
      findByPk: jest.fn(() => null),
      findAll: jest.fn(() => null),
      bulkCreate: jest.fn(() => null),
    },
  }

  beforeEach(async () => {
    const categoriesModuleRef = await Test.createTestingModule({
      providers: [repositoryProvider, wordsProvider, CategoriesService],
    }).compile()

    categoriesService =
      categoriesModuleRef.get<CategoriesService>(CategoriesService)
    wordsService = categoriesModuleRef.get<WordsService>(WordsService)
    model = categoriesModuleRef.get<typeof Category>(getModelToken(Category))
  })

  describe('startLearnCategory', () => {
    let dto: CategoryIdDto, userId: string, traceId: string

    beforeAll(() => {
      dto = { id: '0' }
      userId = '0'
      traceId = '0'
    })

    it('bad id', async () => {
      jest.spyOn(model, 'findByPk').mockReturnValue(null as any)
      await expect(
        categoriesService.startLearnCategory(dto, userId, traceId),
      ).rejects.toThrowError(ERROR_MESSAGES.infoNotFound)
    })
    it('bad userId', async () => {
      jest.spyOn(model, 'findByPk').mockReturnValue({
        userId: '1',
      } as any)
      await expect(
        categoriesService.startLearnCategory(dto, userId, traceId),
      ).rejects.toThrowError(ERROR_MESSAGES.infoNotFound)
    })
    it('low words', async () => {
      jest.spyOn(model, 'findByPk').mockReturnValue({
        userId,
        learns: new Array(ALLOW_WORDS_TO_START_CATEGORY - 1).fill(0),
      } as any)
      await expect(
        categoriesService.startLearnCategory(dto, userId, traceId),
      ).rejects.toThrowError(ERROR_MESSAGES.lowWordsInCategory)
    })
    it('is already learn', async () => {
      jest.spyOn(model, 'findByPk').mockReturnValue({
        userId,
        learns: new Array(ALLOW_WORDS_TO_START_CATEGORY + 1).fill(0),
        isLearn: true,
      } as any)
      await expect(
        categoriesService.startLearnCategory(dto, userId, traceId),
      ).rejects.toThrowError(ERROR_MESSAGES.isLearnCategory)
    })
    it('success', async () => {
      jest.spyOn(model, 'findByPk').mockReturnValue({
        userId,
        learns: new Array(ALLOW_WORDS_TO_START_CATEGORY + 1).fill(0),
        isLearn: false,
        save: () => null,
      } as any)
      await expect(
        categoriesService.startLearnCategory(dto, userId, traceId),
      ).resolves.toBeTruthy()
    })
  })
  describe('studyCategory', () => {
    let ids: string[], userId: string, traceId: string
    const repeatRegularity = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const maxRepeat = repeatRegularity.length
    const testIndex = 7

    function getMockCategories(kind: SessionType, userId: string) {
      const startId = 0
      return [
        {
          [kind === 'normal' ? 'countRepeat' : 'countReverseRepeat']:
            maxRepeat - 1,
          [kind === 'normal' ? 'countReverseRepeat' : 'countRepeat']: maxRepeat,
          repeatRegularity,
          learnStartDate: new Date(),
          id: String(startId + 0),
          userId,
        },
        {
          [kind === 'normal' ? 'countRepeat' : 'countReverseRepeat']:
            maxRepeat - 1,
          [kind === 'normal' ? 'countReverseRepeat' : 'countRepeat']:
            maxRepeat - 1,
          repeatRegularity,
          learnStartDate: new Date(),
          id: String(startId + 1),
          userId,
        },
        {
          [kind === 'normal' ? 'countRepeat' : 'countReverseRepeat']: maxRepeat,
          [kind === 'normal' ? 'countReverseRepeat' : 'countRepeat']:
            maxRepeat - 1,
          repeatRegularity,
          learnStartDate: new Date(),
          id: String(startId + 2),
          userId,
        },
        {
          [kind === 'normal' ? 'countRepeat' : 'countReverseRepeat']: testIndex,
          [kind === 'normal' ? 'countReverseRepeat' : 'countRepeat']:
            maxRepeat - 1,
          repeatRegularity,
          learnStartDate: new Date(),
          id: String(startId + 3),
          userId,
        },
      ]
    }
    beforeAll(() => {
      ids = ['0', '1']
      userId = '0'
      traceId = '0'
    })

    it('correct processing', async () => {
      const kindList: SessionType[] = ['normal', 'reverse']

      for (const kind of kindList) {
        jest.resetAllMocks()
        jest
          .spyOn(categoriesService, 'getAllCategoriesById')
          .mockReturnValue(getMockCategories(kind, userId) as any)
        const repoEditSpy = jest.spyOn(model, 'bulkCreate')
        const wordsServiceSpy = jest.spyOn(wordsService, 'completeCategory')

        await categoriesService.studyCategory(ids, userId, kind, traceId)

        const editedCategories = repoEditSpy.mock.calls[0][0]
        const finishedCategories = wordsServiceSpy.mock.calls[0][0]

        expect(finishedCategories.size).toBe(1)
        expect(finishedCategories.has('0')).toBeTruthy()
        expect(editedCategories.length).toBe(3)
        expect(
          editedCategories[0][
            kind === 'normal' ? 'countRepeat' : 'countReverseRepeat'
          ],
        ).toBe(maxRepeat)
        expect(
          editedCategories[0][
            kind === 'normal' ? 'countReverseRepeat' : 'countRepeat'
          ],
        ).toBe(maxRepeat - 1)
        expect(
          editedCategories[0][
            kind === 'normal' ? 'nextRepeat' : 'nextReverseRepeat'
          ],
        ).toBeNull()
        expect(
          editedCategories[1][
            kind === 'normal' ? 'countRepeat' : 'countReverseRepeat'
          ],
        ).toBe(maxRepeat + 1)
        expect(
          editedCategories[1][
            kind === 'normal' ? 'countReverseRepeat' : 'countRepeat'
          ],
        ).toBe(maxRepeat - 1)
        expect(
          editedCategories[1][
            kind === 'normal' ? 'nextRepeat' : 'nextReverseRepeat'
          ],
        ).toBeNull()
        expect(
          editedCategories[2][
            kind === 'normal' ? 'countRepeat' : 'countReverseRepeat'
          ],
        ).toBe(testIndex + 1)
        expect(
          editedCategories[2][
            kind === 'normal' ? 'countReverseRepeat' : 'countRepeat'
          ],
        ).toBe(maxRepeat - 1)
        expect(
          editedCategories[2][
            kind === 'normal' ? 'nextRepeat' : 'nextReverseRepeat'
          ],
        ).not.toBeNull()
        expect(
          utils.date.differenceDate(
            'days',
            editedCategories[2][
              kind === 'normal' ? 'nextRepeat' : 'nextReverseRepeat'
            ] as Date,
          ),
        ).toBe(repeatRegularity[testIndex + 1])
      }
    })
  })
})
