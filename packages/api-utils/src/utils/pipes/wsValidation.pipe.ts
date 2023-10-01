import { WsException } from '@nestjs/websockets'
import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { ValidationExceptionMessage } from '../exceptions/validation.exception'
import { typings } from '@krainov/kls-utils'

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
            if (!err.property) return result
            result[err.property] = typings.isObject(err.constraints)
              ? [...Object.values(err.constraints)]
              : ['not valid']
            return result
          },
          {},
        )
        throw new WsException({
          messages,
          status: 1007,
          message: 'bad payload',
        })
      }
    }
    return value
  }
}
