export function getRandomString() {
  const idLength = 35
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < idLength; ++i)
    text += possible.charAt(Math.floor(Math.random() * possible.length))

  return text
}
