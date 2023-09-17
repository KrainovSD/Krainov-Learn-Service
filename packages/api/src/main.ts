import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { WsAdapter } from '@nestjs/platform-ws'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import fastifyCookie from '@fastify/cookie'
import { join } from 'path'
import fastifyHelmet from '@fastify/helmet'
import multipart from '@fastify/multipart'

async function start() {
  const PORT = process.env.PORT || 3000
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )
  app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`],
      },
    },
  })

  app.register(multipart, {
    throwFileSizeLimit: true,
  })

  app.useStaticAssets({
    root: join(__dirname, '../../upload'),
    prefix: '/static',
  })

  app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET ?? 'dw3424w',
  })
  app.useWebSocketAdapter(new WsAdapter(app))

  const config = new DocumentBuilder()
    .setTitle('Krainov Learn Service')
    .setDescription('Документация по API')
    .setVersion('1.0.0')
    .addBasicAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Swagger Krainov learn service',
  })

  await app.listen(PORT)
}
start()
