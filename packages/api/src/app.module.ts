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

@Module({
  controllers: [],
  imports: [
    LearnsModule,
    CategoriesModule,
    SettingsModule,
    StatisticsModule,
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
      models: [User, Statistic, Settings, Category],
      autoLoadModels: true,
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
