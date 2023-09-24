import { SettingsModule } from './settings/settings.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from './users/users.model'
import { Settings } from './settings/settings.model'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { logger, nestUtils } from './utils/helpers'
import path from 'path'
import { service } from './const'

@Module({
  imports: [
    logger.LoggerModule.forRoot({
      dirCombined: path.join(__dirname, './../log/combined/'),
      dirWarn: path.join(__dirname, './../log/warn/'),
      defaultMeta: {
        service,
      },
    }),
    SettingsModule,
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
      models: [User, Settings],
      autoLoadModels: true,
    }),
    UsersModule,
    AuthModule,
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
      useClass: nestUtils.pipes.TrimPipe,
    },
    {
      provide: APP_PIPE,
      useClass: nestUtils.pipes.ValidationPipe,
    },
  ],
})
export class AppModule {}
