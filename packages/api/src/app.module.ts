import { LoggerModule } from './logger/logger.module'
import { SessionsModule } from './words/sessions/sessions.module'
import { WorkModule } from './words/work/work.module'
import { RelevancesModule } from './words/relevances/relevances.module'
import { RepeatsModule } from './words/repeats/repeats.module'
import { KnownsModule } from './words/knowns/knowns.module'
import { LearnsModule } from './words/learns/learns.module'
import { CategoriesModule } from './words/categories/categories.module'
import { SettingsModule } from './settings/settings.module'
import { StatisticsModule } from './statistics/statistics.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from './users/users.model'
import { Statistic } from './statistics/statistics.model'
import { Settings } from './settings/settings.model'
import { Category } from './words/categories/categories.model'
import { Learns } from './words/learns/learns.model'
import { Knowns } from './words/knowns/knowns.model'
import { Repeats } from './words/repeats/repeats.model'
import { Relevance } from './words/relevances/relevances.model'
import { WinstonModule } from 'nest-winston'
import winston from 'winston'
import path from 'path'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { HttpExceptionFilter } from './utils/filters/http-exception.filter'
import { LoggerInterceptor } from './utils/interceptors/logger.interceptor'

@Module({
  imports: [
    LoggerModule,
    SessionsModule,
    RelevancesModule,
    RepeatsModule,
    KnownsModule,
    LearnsModule,
    CategoriesModule,
    SettingsModule,
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
      models: [
        User,
        Statistic,
        Settings,
        Category,
        Learns,
        Knowns,
        Repeats,
        Relevance,
      ],
      autoLoadModels: true,
    }),
    UsersModule,
    AuthModule,
    WorkModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class AppModule {}
