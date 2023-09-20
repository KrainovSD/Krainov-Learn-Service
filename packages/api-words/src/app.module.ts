import { LoggerModule } from './logger/logger.module'
import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { WinstonModule } from 'nest-winston'
import winston from 'winston'
import path from 'path'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { HttpExceptionFilter } from './utils/filters/http-exception.filter'
import LoggerMiddleware from './utils/middleware/logger.middleware'
import { TrimPipe } from './utils/pipes/trim.pipe'
import { ValidationPipe } from './utils/pipes/validation.pipe'
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
import { getClientsOptions } from './options'
import { services } from './const'
import { ClientsModule } from '@nestjs/microservices'

@Module({
  imports: [
    LoggerModule,
    SessionsModule,
    RelevancesModule,
    RepeatsModule,
    KnownsModule,
    LearnsModule,
    CategoriesModule,
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
      models: [Category, Learns, Knowns, Repeats, Relevance],
      autoLoadModels: true,
    }),
    WorkModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
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
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
