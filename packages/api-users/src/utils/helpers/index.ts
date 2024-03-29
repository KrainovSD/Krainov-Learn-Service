export * as fsOperation from './fsOperation'
export { _, typings, utils, node } from '@krainov/kls-utils'
export {
  BadRequestEntity,
  ClientMessageDto,
  ForbiddenException,
  SuccessEntity,
  TraceId,
  TransformToNumberPipe,
  TrimPipe,
  UnauthorizedEntity,
  UploadInterceptor,
  UserId,
  ValidationPipe,
  GetMessageDto,
} from '@krainov/kls-api-utils'
export { v4 as uuid } from 'uuid'

import {
  LOGGER_PROVIDER_MODULE,
  LoggerFilter,
  LoggerMiddleware,
  LoggerModule,
  LoggerInterceptor,
} from '@krainov/kls-api-logger'
export type { LoggerService } from '@krainov/kls-api-logger'
export const logger = {
  LOGGER_PROVIDER_MODULE,
  LoggerFilter,
  LoggerMiddleware,
  LoggerModule,
  LoggerInterceptor,
}
