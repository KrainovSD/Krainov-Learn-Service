import { SettingsModule } from './settings/settings.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from './users/users.model'
import { Settings } from './settings/settings.model'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { getClientsOptions } from './options'
import { services } from './const'
import { ClientsModule } from '@nestjs/microservices'
import { nestModules, nestUtils } from './utils/helpers'

@Module({
  imports: [
    ClientsModule.register(
      getClientsOptions(
        services.statistics,
        process.env.RABBIT_QUEUE_STATISTICS,
      ),
    ),
    ClientsModule.register(
      getClientsOptions(services.words, process.env.RABBIT_QUEUE_WORDS),
    ),
    nestModules.LoggerModule,
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
      provide: APP_FILTER,
      useClass: nestUtils.filters.HttpExceptionFilter,
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
    consumer.apply(nestUtils.middleware.LoggerMiddleware).forRoutes('*')
  }
}
