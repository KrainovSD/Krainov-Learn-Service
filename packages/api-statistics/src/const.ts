export const EXPIRES_ACCESS_TOKEN = '24d'
export const EXPIRES_REFRESH_TOKEN = '24d'
export const EXPIRES_COOKIES = 1000 * 60 * 60 * 24 * 24
export const EXPIRES_CACHE = 60 * 60 * 24

export const MAX_SIZE_AVATAR = 2 * 1024 * 1024
export const MAX_SIZE_WALLPAPER = 3 * 1024 * 1024
export const MIME_TYPE_AVATAR = /\/(png|jpeg|jpg|gif)$/
export const MIME_TYPE_WALLPAPER = /\/(png|jpeg|jpg|gif)$/
export const UPLOAD_PATH_AVATAR = './upload/avatar'
export const UPLOAD_PATH_WALLPAPER = './upload/wallpaper'
export const API_VERSION = {
  v1: 'api/v1',
}
export const ROLE_DECORATOR_KEY = 'roles'

export const SALT_ROUNDS = 10
export const ALLOW_WORDS_TO_START_CATEGORY = 0
export const ALLOW_WORDS_AFTER_DELETE_FROM_START_CATEGORY = 2

export const services = {
  users: 'USERS_SERVICE',
  statistics: 'STATISTICS_SERVICE',
  words: 'WORDS_SERVICE',
}

export const SETTINGS_DEFAULT = {
  knownWordsCount: 50,
  mistakesInWordsCount: 3,
  repeatWordsRegularity: [2, 2, 2, 4, 4, 4, 8, 8],
  relevanceObserveDay: 45,
  relevanceObserveCount: 3,
}

export const SWAGGER_DESCRIPTION = {
  success: (type: 'create' | 'delete') =>
    `${type === 'create' ? 'Создано' : 'Удалено'} успешно.`,
  badRequest:
    'При возникновении ошибки валидации, возвращает объект содержащий в качестве ключей названия переменных из формы, которые не прошли валидацию. В качестве значений ключей выступает массив строк с описанием проваленных валидаций.',
}

export const RESPONSE_MESSAGES = {
  success: { message: 'Успешно' },
  sendEmail: {
    message:
      'На вашу электронную почту был отправлен уникальный ключ для завершения операции',
  },
  sendNewEmail: {
    message:
      'На указанную вами электронную почту был отправлен уникальный ключ для завершения операции',
  },
  existWords: (hasWords: Set<string>) => ({
    message: `Следующие слова не были добавлены, так как они уже существуют: ${Array.from(
      hasWords,
    ).join(', ')}`,
  }),
}
export const ERROR_MESSAGES = {
  badKeyOrTime: 'Неверный формат уникального ключа или истекло время операции',
  oftenChage: 'Менять данные можно не чаще, чем раз в 24 часа',
  oftenTryChange:
    'Перед попытками поменять данные должно пройти некоторое время',
  hasNickName: 'Указанный вами псевдоним уже используется другим пользователем',
  hasEmail:
    'Указанный вами адрес электронной почты уже используется другим пользователем',
  changeNickName: 'Менять псевдоним можно не чаще, чем раз в месяц',
  userNotFound: 'Информация о пользователе не найдена',
  infoNotFound: 'Служебная информация не найдена',
  hasCategory: 'Категория с таким именем уже существует',
  isLearnCategory: 'Категория в режиме изучения',
  lowWordsInCategory: `Для начала изучения категории, она должна содержать не менее ${ALLOW_WORDS_TO_START_CATEGORY} слов`,
  hasWord: 'Добавляемое слово уже существует',
  hasRelevanceWord: 'Добавляемое слово уже существует в актуализаторе',
}
export const MAIL_MESSAGES_OPTION = {
  changePassword: {
    title: 'Смена пароля',
    message:
      'Получен запрос на смену пароля на вашем аккаунте. Если этот запрос был отправлен не вами, просто проигнорируйте сообщение. Для завершения операции смена пароля воспользуйтесь следующим кодом',
  },
  callChangeEmail: {
    title: 'Смена адреса электронной почты',
    message:
      'Получен запрос на смену адреса электронной почты на вашем аккаунте. Если этот запрос был отправлен не вами, просто проигнорируйте сообщение. Для продолжения операции смены адреса электронной почты воспользуйтесь следующим кодом',
  },
  regiser: {
    title: 'Активация аккаунта',
    message:
      'Чтобы подтвердить свой Email на Krainov Learn Service и активировать аккаунт воспользуйтесь следующим кодом',
  },
}