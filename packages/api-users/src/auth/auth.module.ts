import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { MailerModule } from '@nestjs-modules/mailer'
import { JwtModule } from '../jwt/jwt.module'

@Module({
  imports: [
    JwtModule,
    UsersModule,
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
  exports: [AuthService],
})
export class AuthModule {}
