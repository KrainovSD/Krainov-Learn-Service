import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { ValidationPipe } from './utils/pipes/validation.pipe'
import { TrimPipe } from './utils/pipes/trim.pipe'
import cookieParser from 'cookie-parser'
import { TransformToNumberPipe } from './utils/pipes/transformNumber.pipe'
import { WsAdapter } from '@nestjs/platform-ws'

async function start() {
  const PORT = process.env.PORT || 3000
  const app = await NestFactory.create(AppModule)
  app.useWebSocketAdapter(new WsAdapter(app))

  const config = new DocumentBuilder()
    .setTitle('Krainov Learn Service')
    .setDescription('Документация по API')
    .setVersion('1.0.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  app.useGlobalPipes(
    new TrimPipe(),
    new TransformToNumberPipe(),
    new ValidationPipe(),
  )
  app.use(cookieParser())

  await app.listen(PORT, () => console.log(`server started at port = ${PORT}`))
}
start()
console.log(process.env.NODE_ENV)
