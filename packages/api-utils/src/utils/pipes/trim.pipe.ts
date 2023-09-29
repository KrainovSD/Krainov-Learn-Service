import { typings } from '@krainov/kls-utils'
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'

type TObject = Record<string, any>

@Injectable()
export class TrimPipe implements PipeTransform {
  private readonly exceptField = ['password']
  private readonly exceptProperties = ['mimetype']

  private isCorretObject(value: any) {
    return (
      typings.isObject(value) &&
      !this.exceptProperties.some((property) => property in value)
    )
  }
  private isNotExceptField(value: string) {
    return !this.exceptField.includes(value)
  }

  private trim(obj: TObject) {
    for (const key in obj) {
      const value = obj[key]
      if (this.isNotExceptField(key) && typings.isString(value))
        obj[key] = obj[key].trim()
      if (this.isCorretObject(obj[key])) {
        obj[key] = this.trim(obj[key])
      }
    }
    return obj
  }

  transform(value: any, metadata: ArgumentMetadata): any {
    if (metadata.type === 'body' && this.isCorretObject(value)) {
      return this.trim(value)
    }
    return value
  }
}
