import { DynamicModule, Global, Module } from '@nestjs/common'
import { CacheModule as ModuleCache } from '@nestjs/cache-manager'
import * as redisStore from 'cache-manager-redis-store'
import { createCacheProvider } from './cache.provider'

export type CacheModuleOptions = {
  host: string | undefined
  port: string | undefined
  ttl: number | undefined
  password: string | undefined
}

@Global()
@Module({})
export class CacheModule {
  public static forRoot(options: CacheModuleOptions): DynamicModule {
    const providers = createCacheProvider()
    const port = options.port ? Number(options.port) : undefined

    return {
      module: CacheModule,
      imports: [
        ModuleCache.register({
          store: redisStore.create({
            port,
            host: options.host,
            no_ready_check: true,
            password: options.password,
          }),
          host: options.host,
          port: options.port,
          ttl: options.ttl,
        }),
      ],
      controllers: [],
      providers: [providers],
      exports: [providers],
    }
  }
}
