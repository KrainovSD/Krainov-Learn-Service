import { WinstonModule } from 'nest-winston'
import { DynamicModule, Global, Module } from '@nestjs/common'
import winston from 'winston'
import { createLoggerProvider } from './logger.provider'

export type LoggerModuleOptions = {
  dirWarn: string
  dirCombined: string
  fileNameWarn?: string
  fileNameCombined?: string
  defaultMeta?: Record<string, string | undefined>
}

@Global()
@Module({})
export class LoggerModule {
  public static forRoot(options: LoggerModuleOptions): DynamicModule {
    const providers = createLoggerProvider()

    return {
      module: LoggerModule,
      imports: [
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
              dirname: options.dirWarn,
              filename: options.fileNameWarn ?? 'warn.log',
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
              dirname: options.dirCombined,
              filename: options.fileNameCombined ?? 'combined.log',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
              ),
            }),
          ],
          defaultMeta: options.defaultMeta,
        }),
      ],
      controllers: [],
      providers: [providers],
      exports: [providers],
    }
  }
}
