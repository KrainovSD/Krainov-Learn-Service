import { CacheService } from './cache.service'
import { Module } from '@nestjs/common'
import { CacheModule as ModuleCache } from '@nestjs/cache-manager'
import * as redisStore from 'cache-manager-redis-store'
import { EXPIRES_CACHE } from 'src/const'

@Module({
  imports: [
    ModuleCache.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: EXPIRES_CACHE,
    }),
  ],
  controllers: [],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
