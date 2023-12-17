export const EXPIRES_COOKIES = 1000 * 60 * 60 * 24 * 24
export const EXPIRES_CACHE = 60 * 60 * 24
export const SALT_ROUNDS = 10

export const API_VERSION = {
  v1: 'api/v1',
}

export const service = 'users'

export const services = {
  users: {
    alias: 'USERS_SERVICE',
    queue: 'users',
  },
  statistics: {
    alias: 'STATISTICS_SERVICE',
    queue: 'statistics',
  },
  words: {
    alias: 'WORDS_SERVICE',
    queue: 'words',
  },
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
  badEmail: 'Неверный адрес электронной почты',
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
