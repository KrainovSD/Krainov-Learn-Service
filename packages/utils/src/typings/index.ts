import { TObject } from '../types'

function isSimpleObject(obj: any): obj is TObject {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    return Object.keys(obj).every((key) => typeof key === 'string')
  }
  return false
}

function isString(value: any): value is string {
  return typeof value === 'string' && value.length > 0
}

function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value)
}

function isId(value: any): value is number | string {
  return isNumber(value) || isString(value)
}

function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean'
}

function isObject(value: any): value is Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value)
}

function isArrayOfObjects(value: any): value is Record<string, any>[] {
  return Array.isArray(value) && value.every((val) => isObject(val))
}

function isArray(value: any): value is any[] {
  return value && Array.isArray(value)
}

function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined'
}

function isNull(value: any): value is null {
  return value === null
}

function custom<T>(value: any, condition: boolean): value is T {
  return condition
}

export default {
  isString,
  isSimpleObject,
  isNumber,
  isId,
  isBoolean,
  isObject,
  isArrayOfObjects,
  isArray,
  isUndefined,
  isNull,
  custom,
}
