import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { WinstonModule } from 'nest-winston'
import winston from 'winston'
import path from 'path'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { SessionsModule } from './sessions/sessions.module'
import { RelevancesModule } from './relevances/relevances.module'
import { RepeatsModule } from './repeats/repeats.module'
import { KnownsModule } from './knowns/knowns.module'
import { LearnsModule } from './learns/learns.module'
import { CategoriesModule } from './categories/categories.module'
import { Category } from './categories/categories.model'
import { Learns } from './learns/learns.model'
import { Knowns } from './knowns/knowns.model'
import { Repeats } from './repeats/repeats.model'
import { Relevance } from './relevances/relevances.model'
import { WorkModule } from './work/work.module'
import { TrimPipe, ValidationPipe, cache, logger } from './utils'
import { EXPIRES_CACHE } from './const'
import { WordsModule } from './words/words.module'
import { ClientModule } from './clients/client.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    cache.CacheModule.forRoot({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: EXPIRES_CACHE,
      password: process.env.REDIS_PASSWORD,
    }),
    logger.LoggerModule.forRoot({
      dirCombined: path.join(__dirname, './../log/combined/'),
      dirWarn: path.join(__dirname, './../log/warn/'),
    }),

    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: 'info',
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
          handleExceptions: true,
          handleRejections: true,
        }),
        new winston.transports.File({
          dirname: path.join(__dirname, './../log/warn/'),
          filename: 'warn.log',
          level: 'warn',
          format: winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.timestamp(),
            winston.format.json(),
          ),
          handleExceptions: true,
          handleRejections: true,
        }),
        new winston.transports.File({
          dirname: path.join(__dirname, './../log/combined/'),
          filename: 'combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [Category, Learns, Knowns, Repeats, Relevance],
      autoLoadModels: true,
    }),
    WordsModule,
    WorkModule,
    SessionsModule,
    RelevancesModule,
    RepeatsModule,
    KnownsModule,
    LearnsModule,
    CategoriesModule,
    ClientModule,
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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger.LoggerMiddleware).forRoutes('*')
  }
}
