import { typings, _ } from '..'

//TODO: Переименовать в random key
export function getRandomString(
  lenght: number = 8,
  possible: string = '0123456789',
) {
  let text = ''
  for (var i = 0; i < lenght; ++i)
    text += possible.charAt(Math.floor(Math.random() * possible.length))

  return text
}

export function getUniqueId() {
  return (
    `${Math.floor(Math.random() * Date.now())}`.substring(0, 5) +
    '_' +
    `${getRandomString(
      5,
      'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm',
    )}`
  )
}

export function checkIrregularVerb(word: string) {
  const splitWord = word.split('--').filter((item) => typings.isString(item))
  if (splitWord.length === 3) return true
  return false
}

export function updateNewValue(
  oldObj: Record<string, any>,
  newObj: Record<string, any>,
  exception: string[] = [],
) {
  for (const field in newObj) {
    if (exception.includes(field)) continue
    const oldValue = _.get(oldObj, field, undefined)
    const newValue = _.get(newObj, field, undefined)
    if (typings.isUndefined(oldValue) || typings.isUndefined(newValue)) continue
    if (oldValue === newValue) continue
    _.set(oldObj, field, newValue)
  }
}
