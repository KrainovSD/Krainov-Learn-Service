import { getModelToken } from '@nestjs/sequelize'
import { StatisticsService } from './statistics.service'
import { Test } from '@nestjs/testing'
import { Statistic } from './statistics.model'
import { Provider } from '@nestjs/common'
import { cache, logger, utils } from '../utils'
import { ClientService } from '../clients/client.service'

describe('Statistic Service', () => {
  let statisticService: StatisticsService
  let model: typeof Statistic
  const repositoryProvider: Provider = {
    provide: getModelToken(Statistic),
    useValue: {
      create: jest.fn(() => ({
        id: '3850de1c-6b55-47e5-817f-bd02aaa69cf9',
        userId: '3850de1c-6b55-47e5-817f-bd02aaa69cf9',
        save: () => null,
      })),
    },
  }
  const redisProvider: Provider = {
    provide: cache.CACHE_PROVIDER_MODULE,
    useValue: {
      setBestStreak: jest.fn(() => null),
      getBestStreak: jest.fn(() => null),
      delBestStreak: jest.fn(() => null),
      get: jest.fn(() => null),
      set: jest.fn(() => null),
      reset: jest.fn(() => null),
      del: jest.fn(() => null),
    },
  }
  const loggerProvider: Provider = {
    provide: logger.LOGGER_PROVIDER_MODULE,
    useValue: {
      startRequest: jest.fn(() => null),
      endRequest: jest.fn(() => null),
      errorRequest: jest.fn(() => null),
      startWsMessage: jest.fn(() => null),
      endWsMessage: jest.fn(() => null),
      warnWsMessage: jest.fn(() => null),
      errorWsMessage: jest.fn(() => null),
      startEvent: jest.fn(() => null),
      endEvent: jest.fn(() => null),
      errorEvent: jest.fn(() => null),
      sendEvent: jest.fn(() => null),
      answerSuccess: jest.fn(() => null),
      answerError: jest.fn(() => null),
      info: jest.fn(() => null),
      error: jest.fn(() => null),
      warn: jest.fn(() => null),
    },
  }
  const clientProvider: Provider = {
    provide: ClientService,
    useValue: {},
  }

  beforeEach(async () => {
    const statisticModuleRef = await Test.createTestingModule({
      providers: [
        StatisticsService,
        repositoryProvider,
        redisProvider,
        loggerProvider,
        clientProvider,
      ],
    }).compile()

    statisticService =
      statisticModuleRef.get<StatisticsService>(StatisticsService)
    model = statisticModuleRef.get<typeof Statistic>(getModelToken(Statistic))
  })

  describe('setStreak', () => {
    let statistic: Statistic
    beforeEach(async () => {
      statistic = await model.create()
    })

    it('increase current streak', () => {
      const bestStreak = 1
      const currentStreak = 3

      statistic.bestStreak = bestStreak
      statistic.currentStreak = currentStreak
      statistic.lastStreakDate = utils.date.getDate(-1, 'days')
      statisticService.setStreak(statistic)
      expect(statistic.bestStreak).toBe(bestStreak)
      expect(statistic.currentStreak).toBe(currentStreak + 1)
    })
    it('drop current streak', () => {
      const bestStreak = 4
      const currentStreak = 3
      statistic.bestStreak = bestStreak
      statistic.currentStreak = currentStreak
      statistic.lastStreakDate = utils.date.getDate(-2, 'days')
      statisticService.setStreak(statistic)
      expect(statistic.bestStreak).toBe(bestStreak)
      expect(statistic.currentStreak).toBe(1)
    })
    it('drop current streak and increase best streak', () => {
      const bestStreak = 1
      const currentStreak = 3
      statistic.bestStreak = bestStreak
      statistic.currentStreak = currentStreak
      statistic.lastStreakDate = utils.date.getDate(-2, 'days')
      statisticService.setStreak(statistic)
      expect(statistic.bestStreak).toBe(currentStreak)
      expect(statistic.currentStreak).toBe(1)
    })
    it('already set streak today', () => {
      statistic.bestStreak = 1
      statistic.currentStreak = 3
      statistic.lastStreakDate = utils.date.getDate(0, 'days')
      return expect(statisticService.setStreak(statistic)).resolves.toBeFalsy()
    })
    it('no statistic', () => {
      return expect(statisticService.setStreak(null)).resolves.toBeFalsy()
    })
  })
})
