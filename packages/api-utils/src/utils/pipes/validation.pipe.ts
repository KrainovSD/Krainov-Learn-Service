import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import {
  ValidationException,
  ValidationExceptionMessage,
} from '../exceptions/validation.exception'
import { typings } from '@krainov/kls-utils'

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (metadata.metatype && metadata.type !== 'custom' && value) {
      const obj = plainToInstance(metadata.metatype, value)
      const errors = await validate(obj, {
        whitelist: true,
        forbidNonWhitelisted: true,
      })

      if (errors.length) {
        const messages = errors.reduce(
          (result: ValidationExceptionMessage, err) => {
            if (!err.property) return result
            result[err.property] = typings.isObject(err.constraints)
              ? [...Object.values(err.constraints)]
              : ['not valid']
            return result
          },
          {},
        )
        throw new ValidationException(messages, JSON.stringify(value))
      }
    }
    return value
  }
}
