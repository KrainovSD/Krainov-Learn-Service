import { Inject, Injectable } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { typings, utils } from '@krainov/utils'

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.cache.get(key)
    return utils.common.safeJsonParse<T>(value)
  }

  async set(key: string, value: any) {
    let cacheValue: string = value
    if (typings.isArray(value) || typings.isObject(value)) {
      cacheValue = JSON.stringify(value)
      await this.cache.set(key, cacheValue)
      return
    }
    if (!typings.isString(value)) {
      cacheValue = String(value)
      await this.cache.set(key, cacheValue)
      return
    }
    await this.cache.set(key, cacheValue)
  }

  async reset() {
    await this.cache.reset()
  }

  async del(key: string) {
    await this.cache.del(key)
  }
}
