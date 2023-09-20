import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { ValidationExceptionMessage } from '../exceptions/validation.exception'

@Injectable()
export class WSValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (metadata.type === 'custom') return value
    if (metadata.metatype) {
      const obj = plainToInstance(metadata.metatype, value)
      const errors = await validate(obj, {
        whitelist: true,
        forbidNonWhitelisted: true,
      })

      if (errors.length) {
        const messages = errors.reduce(
          (result: ValidationExceptionMessage, err) => {
            if (!err.constraints) return result
            result[err.property] = [...Object.values(err.constraints)]
            return result
          },
          {},
        )
        //FIXME: Удалить после отладки
        console.log(messages)
        return null
      }
    }
    return value
  }
}
