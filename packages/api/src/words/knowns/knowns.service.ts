import { InjectModel } from '@nestjs/sequelize'
import { Injectable } from '@nestjs/common'
import { Knowns } from './knowns.model'
import { CreateKnownsDto } from './dto/create-knowns-dto'
import { checkIrregularVerb } from 'src/utils/helpers'

@Injectable()
export class KnownsService {
  constructor(@InjectModel(Knowns) private readonly knownRepo: typeof Knowns) {}

  async createKnown(dto: CreateKnownsDto) {
    //FIXME: Проверка на слово
    const isIrregularVerb = checkIrregularVerb(dto.word)
    const dateCreate = new Date()
    const known = await this.knownRepo.create({
      ...dto,
      isIrregularVerb,
      dateCreate,
    })
    return known
  }
}
