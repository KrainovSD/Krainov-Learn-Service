// import { CategoriesModule } from '../categories/categories.module'
// import { KnownsModule } from '../knowns/knowns.module'
// import { LearnsModule } from '../learns/learns.module'
// import { RepeatsModule } from '../repeats/repeats.module'
// import { WorkGateway } from './work.event'
// import { WorkService } from './work.service'

// import { Module } from '@nestjs/common'

// @Module({
//   providers: [WorkGateway],
// })
// export class WorkModule {}

import { Module } from '@nestjs/common'
import { WorkGateway } from './workGateway'

@Module({
  providers: [WorkGateway],
})
export class WorkModule {}
