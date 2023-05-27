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
