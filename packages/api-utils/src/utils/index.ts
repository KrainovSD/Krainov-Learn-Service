import { BadRequestEntity, SuccessEntity, UnauthorizedEntity } from './entities'
import { ForbiddenException, ValidationException } from './exceptions'
import { UploadInterceptor } from './interceptors'
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
  interceptors: {
    UploadInterceptor,
  },
  pipes: {
    TransformToNumberPipe,
    TrimPipe,
    ValidationPipe,
    WSValidationPipe,
  },
}
