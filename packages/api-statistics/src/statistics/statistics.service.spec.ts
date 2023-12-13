import { getModelToken } from '@nestjs/sequelize'
import { StatisticsService } from './statistics.service'
import { Test } from '@nestjs/testing'
import { Statistic } from './statistics.model'
import { Provider } from '@nestjs/common'
import { cache, logger } from '../utils'
import { ClientService } from '../clients/client.service'

describe('Statistic Service', () => {
  let statisticService: StatisticsService
  const repositoryProvider: Provider = {
    provide: getModelToken(Statistic),
    useValue: {
      findOne: jest.fn(() => null),
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
  })

  describe('setStreak', () => {
    let statistic: Statistic
    beforeEach(() => {
      statistic = {
        id: '3850de1c-6b55-47e5-817f-bd02aaa69cf9',
        userId: '3850de1c-6b55-47e5-817f-bd02aaa69cf9',
        bestSteak: 1,
        currentStreak: 3,
        lastStreakDate: new Date(),
      }
    })

    it('increase current streak', () => {
      statisticService.setStreak(statistic)
      expect(statistic.bestSteak).toBe(2)
      expect(statistic.currentStreak).toBe(3)
    })
    // it('drop current streak', () => {})
    // it('drop current streak and increase best streak', () => {})
    // it('already set streak today', () => {})
    // it('no statistic', () => {})
  })
})
