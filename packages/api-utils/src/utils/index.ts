import { BadRequestEntity, SuccessEntity, UnauthorizedEntity } from './entities'
import { ForbiddenException, ValidationException } from './exceptions'
import { HttpExceptionFilter } from './filters'
import { LoggerMiddleware } from './middleware'
import { LoggerInterceptor, UploadInterceptor } from './interceptors'
import {
  TransformToNumberPipe,
  TrimPipe,
  ValidationPipe,
  WSValidationPipe,
} from './pipes'

export default {
  entities: {
    BadRequestEntity,
    SuccessEntity,
    UnauthorizedEntity,
  },
  exceptions: {
    ForbiddenException,
    ValidationException,
  },
  filters: {
    HttpExceptionFilter,
  },
  middleware: {
    LoggerMiddleware,
  },
  interceptors: {
    LoggerInterceptor,
    UploadInterceptor,
  },
  pipes: {
    TransformToNumberPipe,
    TrimPipe,
    ValidationPipe,
    WSValidationPipe,
  },
}
