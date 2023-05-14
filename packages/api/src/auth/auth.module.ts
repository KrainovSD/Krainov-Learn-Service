import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt/dist'

import { Module, forwardRef } from '@nestjs/common'
import { UsersModule } from 'src/users/users.module'
import { MailerModule } from '@nestjs-modules/mailer'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    JwtModule,
    forwardRef(() => UsersModule),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        tls: {
          rejectUnauthorized: false,
        },
        auth: {
          user: process.env.MAIL_LOGIN,
          pass: process.env.MAIL_PASSWORD,
        },
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule, MailerModule],
})
export class AuthModule {}
