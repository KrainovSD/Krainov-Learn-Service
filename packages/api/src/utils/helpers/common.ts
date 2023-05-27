export function getRandomString() {
  const idLength = 8
  let text = ''
  const possible = '0123456789'
  for (var i = 0; i < idLength; ++i)
    text += possible.charAt(Math.floor(Math.random() * possible.length))

  return text
}
