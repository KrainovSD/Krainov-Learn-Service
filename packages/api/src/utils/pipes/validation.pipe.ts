import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import {
  ValidationException,
  ValidationExceptionMessage,
} from '../exceptions/validation.exception'

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (metadata.metatype) {
      const obj = plainToInstance(metadata.metatype, value)
      const errors = await validate(obj)

      if (errors.length) {
        const messages = errors.reduce(
          (result: ValidationExceptionMessage, err) => {
            if (!err.constraints) return result
            result[err.property] = [...Object.values(err.constraints)]
            return result
          },
          {},
        )
        throw new ValidationException(messages)
      }
    }
    return value
  }
}
