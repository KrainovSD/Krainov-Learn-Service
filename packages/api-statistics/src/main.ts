import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { join } from 'path'
import fastifyHelmet from '@fastify/helmet'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { API_VERSION } from './const'

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

  app.useStaticAssets({
    root: join(__dirname, '../../upload'),
    prefix: `${API_VERSION.v1}/static`,
  })

  const config = new DocumentBuilder()
    .setTitle('Swagger KLS Statistics')
    .setDescription('Документация по API')
    .setVersion('1.0.0')
    .addBasicAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup(`${API_VERSION.v1}/docs`, app, document, {
    customSiteTitle: 'Swagger KLS Statistics',
  })

  const microservice = app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          {
            hostname: process.env.RABBIT_HOST ?? 'localhost',
            port: process.env.RABBIT_PORT
              ? Number(process.env.RABBIT_PORT)
              : 5672,
            protocol: process.env.RABBIT_PROTOCOL ?? 'amqp',
            username: process.env.RABBIT_USER ?? 'guest',
            password: process.env.RABBIT_PASSWORD ?? 'guest',
          },
        ],
        queue: process.env.RABBIT_QUEUE_STATISTICS,
        queueOptions: {
          durable: false,
        },
      },
    },
    { inheritAppConfig: true },
  )
  await app.startAllMicroservices()
  await app.listen(PORT)
}
start()
