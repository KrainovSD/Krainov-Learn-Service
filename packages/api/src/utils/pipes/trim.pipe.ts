import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'

type TObject = {
  [key: string]: any
}

@Injectable()
export class TrimPipe implements PipeTransform {
  private readonly except = ['password']

  private isNotExcept(value: string) {
    return !this.except.includes(value)
  }

  private isObject(obj: any): obj is TObject {
    if (typeof obj === 'object' && !Array.isArray(obj)) {
      return Object.keys(obj).every((key) => typeof key === 'string')
    }
    return false
  }

  private isString(value: any): value is string {
    return typeof value === 'string' && value !== ''
  }

  private trim(obj: TObject) {
    for (const key in obj) {
      const value = obj[key]
      if (this.isNotExcept(key) && this.isString(value))
        obj[key] = obj[key].trim()
      if (this.isObject(obj[key])) {
        obj[key] = this.trim(obj[key])
      }
    }
    return obj
  }

  transform(value: any, metadata: ArgumentMetadata): any {
    if (metadata.type === 'body' && this.isObject(value)) {
      return this.trim(value)
    }
    return value
  }
}
