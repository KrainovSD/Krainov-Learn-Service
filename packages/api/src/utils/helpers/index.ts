export function getRandomString() {
  const idLength = 8
  let text = ''
  const possible = '0123456789'
  for (var i = 0; i < idLength; ++i)
    text += possible.charAt(Math.floor(Math.random() * possible.length))

  return text
}

type TObject = Record<string, any>

export const checkTypes = {
  isObject: (obj: any): obj is TObject => {
    if (typeof obj === 'object' && !Array.isArray(obj)) {
      return Object.keys(obj).every((key) => typeof key === 'string')
    }
    return false
  },
  isString: (value: any): value is string => {
    return value && typeof value === 'string' && value !== ''
  },
  isNumber: (value: any): value is number => {
    return value && typeof value === 'number'
  },
  isBoolean: (value: any): value is boolean => {
    return value && typeof value === 'boolean'
  },
  custom: <T>(value: any, condition: boolean): value is T => {
    return condition
  },
}
