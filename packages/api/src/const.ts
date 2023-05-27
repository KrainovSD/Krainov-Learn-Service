export const EXPIRES_ACCESS_TOKEN = '24d'

export const EXPIRES_REFRESH_TOKEN = '24d'

export const EXPIRES_COOKIES = 1000 * 60 * 60 * 24 * 24

export const SALT_ROUNDS = 10

export const SETTINGS_DEFAULT = {
  knownWordsCount: 50,
  mistakesInWordsCount: 3,
  repeatWordsRegularity: [2, 2, 2, 4, 4, 4, 8, 8],
  relevanceObserveDay: 45,
  relevanceObserveCount: 3,
}

export const REQUEST_MESSAGES = {
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
