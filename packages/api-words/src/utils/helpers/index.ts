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
  ValidationException,
  ValidationPipe,
  WSValidationPipe,
} from '@krainov/kls-api-utils'
export { v4 as uuid } from 'uuid'

import {
  LOGGER_PROVIDER_MODULE,
  LoggerFilter,
  LoggerMiddleware,
  LoggerModule,
} from '@krainov/kls-api-logger'
export type { LoggerService } from '@krainov/kls-api-logger'
export const logger = {
  LOGGER_PROVIDER_MODULE,
  LoggerFilter,
  LoggerMiddleware,
  LoggerModule,
}

import { CACHE_PROVIDER_MODULE, CacheModule } from '@krainov/kls-api-cache'
export type { CacheService } from '@krainov/kls-api-cache'
export const cache = {
  CACHE_PROVIDER_MODULE,
  CacheModule,
}
