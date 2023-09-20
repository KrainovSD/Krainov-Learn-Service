import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { typings } from '../helpers'

@Injectable()
export class TransformToNumberPipe implements PipeTransform {
  private transformToInt(str: string) {
    const nums = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'])
    if (![...str].every((x) => nums.has(x))) return null
    const transformed = parseInt(str)
    return isNaN(transformed) ? null : transformed
  }

  transform(obj: any, metadata: ArgumentMetadata): any {
    if (
      (metadata.type === 'param' || metadata.type === 'query') &&
      typings.isSimpleObject(obj)
    ) {
      for (const key in obj) {
        const value = obj[key]
        if (typings.isString(value)) {
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
