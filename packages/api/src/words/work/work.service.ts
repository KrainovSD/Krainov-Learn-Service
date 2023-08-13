import { Injectable } from '@nestjs/common'
import { CategoriesService } from '../categories/categories.service'
import { KnownsService } from '../knowns/knowns.service'
import { RepeatsService } from '../repeats/repeats.service'
import { LearnsService } from '../learns/learns.service'

@Injectable()
export class WorkService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly knownsService: KnownsService,
    private readonly repeatsService: RepeatsService,
    private readonly leaarnsService: LearnsService,
  ) {}
}
