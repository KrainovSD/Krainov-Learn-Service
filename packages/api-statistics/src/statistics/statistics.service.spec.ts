import { SequelizeModule } from '@nestjs/sequelize'
import { StatisticsService } from './statistics.service'
import { Test } from '@nestjs/testing'
import { Statistic } from './statistics.model'
import { ClientModule } from '../clients/client.module'
import { StatisticsController } from './statistics.controller'
import { JwtModule } from '@nestjs/jwt'

describe('Statistic Service', () => {
  let statisticService: StatisticsService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        SequelizeModule.forFeature([Statistic]),
        JwtModule,
        ClientModule,
      ],
      controllers: [StatisticsController],
      providers: [StatisticsService],
    }).compile()

    statisticService = moduleRef.get<StatisticsService>(StatisticsService)
  })

  describe('test', () => {
    it('kek', () => {
      expect(statisticService.test()).toMatch('lol')
    })
  })
})
