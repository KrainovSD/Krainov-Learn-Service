import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { checkTypes } from '../helpers'

@Injectable()
export class TransformToNumberPipe implements PipeTransform {
  private transformToInt(str: string) {
    const transformed = parseInt(str)
    return isNaN(transformed) ? null : transformed
  }

  transform(obj: any, metadata: ArgumentMetadata): any {
    if (
      (metadata.type === 'param' || metadata.type === 'query') &&
      checkTypes.isObject(obj)
    ) {
      for (const key in obj) {
        const value = obj[key]
        if (checkTypes.isString(value)) {
          const transformed = this.transformToInt(value)
          if (transformed) {
            obj[key] = transformed
          }
        }
      }
    }
    return obj
  }
}
