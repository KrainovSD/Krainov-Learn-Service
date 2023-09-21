import { Provider } from '@nestjs/common'
import { CacheService } from './cache.service'
import { CACHE_PROVIDER_MODULE } from './cache.constants'

export function createCacheProvider(): Provider {
  return {
    provide: CACHE_PROVIDER_MODULE,
    useClass: CacheService,
  }
}
