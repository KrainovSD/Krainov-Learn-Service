import { StatisticsModule } from './statistics/statistics.module'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { Statistic } from './statistics/statistics.model'
import path from 'path'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { TrimPipe, ValidationPipe, cache, logger } from './utils/helpers'
import { EXPIRES_CACHE, service } from './const'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    cache.CacheModule.forRoot({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      ttl: EXPIRES_CACHE,
    }),
    logger.LoggerModule.forRoot({
      dirCombined: path.join(__dirname, './../log/combined/'),
      dirWarn: path.join(__dirname, './../log/warn/'),
      defaultMeta: {
        service,
      },
    }),
    StatisticsModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [Statistic],
      autoLoadModels: true,
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: logger.LoggerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: logger.LoggerFilter,
    },
    {
      provide: APP_PIPE,
      useClass: TrimPipe,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
