export const EXPIRES_CACHE = 60 * 60 * 24

export const API_VERSION = {
  v1: 'api/v1',
}

export const service = 'statistics'

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
}
export const ERROR_MESSAGES = {
  badKeyOrTime: 'Неверный формат уникального ключа или истекло время операции',
  infoNotFound: 'Служебная информация не найдена',
}
