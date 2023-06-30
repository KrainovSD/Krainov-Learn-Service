export type TObject = Record<string, any>

export function isSimpleObject(obj: any): obj is TObject {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    return Object.keys(obj).every((key) => typeof key === 'string')
  }
  return false
}

export function isString(value: any): value is string {
  return typeof value === 'string' && value.length > 0
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isId(value: any): value is number | string {
  return isNumber(value) || isString(value)
}

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean'
}

export function isObject(value: any): value is Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value)
}

export function isArrayOfObjects(value: any): value is Record<string, any>[] {
  return Array.isArray(value) && value.every((val) => isObject(val))
}

export function isArray(value: any): value is any[] {
  return value && Array.isArray(value)
}

export function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined'
}

export function isNull(value: any): value is null {
  return value === null
}

export function custom<T>(value: any, condition: boolean): value is T {
  return condition
}
