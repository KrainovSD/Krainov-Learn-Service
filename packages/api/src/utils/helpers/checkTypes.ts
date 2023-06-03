type TObject = Record<string, any>

export function isSimpleObject(obj: any): obj is TObject {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    return Object.keys(obj).every((key) => typeof key === 'string')
  }
  return false
}

export function isString(value: any): value is string {
  return value && typeof value === 'string' && value !== ''
}

export function isNumber(value: any): value is number {
  return value && typeof value === 'number'
}

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean'
}

export function custom<T>(value: any, condition: boolean): value is T {
  return condition
}
