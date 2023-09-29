import { BadRequestException, Injectable } from '@nestjs/common'
import { Learns } from './learns.model'
import { InjectModel } from '@nestjs/sequelize'
import { CreateLearnDto } from './dto/create-learns-dto'
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from 'src/const'
import { utils, uuid } from 'src/utils/helpers'
import { UpdateLearnsDto } from './dto/update-learns.dto'
import { Category } from '../categories/categories.model'
import { Op } from 'sequelize'
import { WorkKind } from '../work/work.service'
import { WordsService } from 'src/words/words.service'
import { ALLOW_WORDS_AFTER_DELETE_FROM_START_CATEGORY } from './learns.constants'

@Injectable()
export class LearnsService {
  constructor(
    @InjectModel(Learns) private readonly learnsRepo: typeof Learns,
    private readonly wordsService: WordsService,
  ) {}

  async createLearn(dto: CreateLearnDto, userId: string, traceId: string) {
    const category = await this.wordsService.getWordsCategory(
      dto.categoryId,
      userId,
      traceId,
    )
    if (category.isLearn)
      throw new BadRequestException(ERROR_MESSAGES.isLearnCategory)

    await this.wordsService.checkHasWord({
      currentWord: dto.word,
      traceId,
      userId,
      type: 'learn',
      learnForce: dto.force,
    })

    const isIrregularVerb = utils.common.checkIrregularVerb(dto.word)
    await this.learnsRepo.create({
      ...dto,
      isIrregularVerb,
      id: uuid(),
    })

    return RESPONSE_MESSAGES.success
  }
  async deleteLearn(
    ids: string[],
    categoryId: string,
    userId: string,
    traceId: string,
  ) {
    const learns = await this.getAllLearnsById(ids)

    const category = await this.wordsService.getWordsCategory(
      categoryId,
      userId,
      traceId,
    )
    if (
      category.isLearn &&
      category.learns.length <= ALLOW_WORDS_AFTER_DELETE_FROM_START_CATEGORY
    )
      throw new BadRequestException(ERROR_MESSAGES.isLearnCategory)

    const checkedIds: string[] = []
    for (const learn of learns) {
      if (learn.categoryId === categoryId) checkedIds.push(learn.id)
    }

    await this.learnsRepo.destroy({ where: { id: checkedIds } })
    return RESPONSE_MESSAGES.success
  }
  async updateLearn(dto: UpdateLearnsDto, userId: string, traceId: string) {
    const newCategory = await this.wordsService.getWordsCategory(
      dto.categoryId,
      userId,
      traceId,
    )
    const learn = await this.getLearnById(dto.id)
    if (!learn) throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    if (learn.categoryId !== dto.categoryId) {
      const odlCategory = await this.wordsService.getWordsCategory(
        learn.categoryId,
        userId,
        traceId,
      )
      if (odlCategory.isLearn || newCategory.isLearn)
        throw new BadRequestException(ERROR_MESSAGES.isLearnCategory)
    }

    await this.wordsService.checkHasWord({
      currentWord: dto.word,
      traceId,
      userId,
      type: 'learn',
      id: dto.id,
      learnForce: dto.force,
    })

    const isIrregularVerb = utils.common.checkIrregularVerb(dto.word)
    learn.isIrregularVerb = isIrregularVerb

    utils.common.updateNewValue(learn, dto, ['id'])
    await learn.save()
    return RESPONSE_MESSAGES.success
  }
  async getAllLearns(userId: string, traceId: string) {
    const learns = await this.getAllLearnsByUserId(userId)
    if (!learns) throw new BadRequestException(ERROR_MESSAGES.infoNotFound)
    return learns
  }
  async studyLearn(
    id: string,
    userId: string,
    option: string,
    kind: WorkKind,
    traceId: string,
  ) {
    const word = await this.getLearnById(id)
    if (!word) throw new BadRequestException(ERROR_MESSAGES.userNotFound)
    await this.wordsService.getWordsCategory(word.categoryId, userId, traceId)

    const result =
      kind === 'normal' ? word.word === option : word.translate === option

    if (!result) {
      const settings = await this.wordsService.getUserSettings(userId, traceId)
      if (!settings) throw new BadRequestException()
      const countMistakes = settings.mistakesInWordsCount
      word.mistakes++
      word.mistakesTotal++

      if (word.mistakes === countMistakes) {
        await this.wordsService.registerWordWithMistakes(
          {
            word: word.word,
            transcription: word.transcription,
            translate: word.translate,
            description: word.description,
            example: word.example,
          },
          userId,
          traceId,
        )

        word.mistakes = 0
      }

      await word.save()
    }
    return result
  }

  async getLearnById(id: string) {
    return await this.learnsRepo.findByPk(id)
  }
  async getLearnByWordAndUserId(word: string, userId: string) {
    return await this.learnsRepo.findOne({
      where: { word },
      include: [
        {
          model: Category,
          attributes: ['id'],
          where: { userId },
        },
      ],
      raw: true,
    })
  }
  async getAllLearnsByUserId(userId: string) {
    return await this.learnsRepo.findAll({
      where: {},
      include: [
        {
          model: Category,
          attributes: ['id'],
          where: { userId },
        },
      ],
      raw: true,
    })
  }
  async getAllLearnsById(ids: string[]) {
    return await this.learnsRepo.findAll({ where: { id: ids } })
  }
  async getAllLearnsByWordAndUserId(word: string | string[], userId: string) {
    return await this.learnsRepo.findAll({
      where: { word },
      include: [
        {
          model: Category,
          attributes: ['id'],
          where: { userId },
        },
      ],
      raw: true,
    })
  }
  async getAllLearnsByCategoryIds(ids: string[]) {
    return await this.learnsRepo.findAll({ where: { categoryId: ids } })
  }
  async getLearnsForNormalSession(
    userId: string,
    traceId: string,
    categoryIds?: string[],
  ): Promise<Pick<Learns, 'id' | 'word' | 'translate' | 'categoryId'>[]> {
    if (!categoryIds) {
      categoryIds = await this.wordsService.getWordsCategoryIdsForSession(
        'normal',
        userId,
        traceId,
      )
    }

    return await this.learnsRepo.findAll({
      attributes: ['id', 'translate', 'word', 'categoryId'],
      where: {
        categoryId: {
          [Op.in]: categoryIds,
        },
      },
    })
  }
  async getLearnsForReverseSession(
    userId: string,
    traceId: string,
    categoryIds?: string[],
  ): Promise<Pick<Learns, 'id' | 'word' | 'translate' | 'categoryId'>[]> {
    if (!categoryIds) {
      categoryIds = await this.wordsService.getWordsCategoryIdsForSession(
        'reverse',
        userId,
        traceId,
      )
    }

    return await this.learnsRepo.findAll({
      attributes: ['id', 'translate', 'word', 'categoryId'],
      where: {
        categoryId: {
          [Op.in]: categoryIds,
        },
      },
    })
  }
}
