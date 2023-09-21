import { StatisticsModule } from './statistics/statistics.module'
import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { Statistic } from './statistics/statistics.model'
import { WinstonModule } from 'nest-winston'
import winston from 'winston'
import path from 'path'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { cache, logger, nestUtils } from './utils/helpers'
import { EXPIRES_CACHE } from './const'

@Module({
  imports: [
    cache.CacheModule.forRoot({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: EXPIRES_CACHE,
    }),
    logger.LoggerModule.forRoot({
      dirCombined: path.join(__dirname, './../log/combined/'),
      dirWarn: path.join(__dirname, './../log/warn/'),
    }),
    StatisticsModule,
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
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
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
      provide: APP_FILTER,
      useClass: logger.LoggerFilter,
    },
    {
      provide: APP_PIPE,
      useClass: nestUtils.pipes.TrimPipe,
    },
    {
      provide: APP_PIPE,
      useClass: nestUtils.pipes.ValidationPipe,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger.LoggerMiddleware).forRoutes('*')
  }
}
