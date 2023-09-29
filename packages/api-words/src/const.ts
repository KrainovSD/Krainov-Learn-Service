import { ALLOW_WORDS_TO_START_CATEGORY } from './categories/categories.constants'

export const API_VERSION = {
  v1: 'api/v1',
}

export const service = 'words'

export const services = {
  users: 'USERS_SERVICE',
  statistics: 'STATISTICS_SERVICE',
  words: 'WORDS_SERVICE',
}

export const SWAGGER_DESCRIPTION = {
  success: (type: 'create' | 'delete') =>
    `${type === 'create' ? 'Создано' : 'Удалено'} успешно.`,
  badRequest:
    'При возникновении ошибки валидации, возвращает объект содержащий в качестве ключей названия переменных из формы, которые не прошли валидацию. В качестве значений ключей выступает массив строк с описанием проваленных валидаций.',
}

export const RESPONSE_MESSAGES = {
  success: { message: 'Успешно' },
  existWords: (hasWords: Set<string>) => ({
    message: `Следующие слова не были добавлены, так как они уже существуют: ${Array.from(
      hasWords,
    ).join(', ')}`,
  }),
}
export const ERROR_MESSAGES = {
  userNotFound: 'Информация о пользователе не найдена',
  infoNotFound: 'Служебная информация не найдена',
  settingsNotFound: 'Настройки пользователя не найдены',
  hasCategory: 'Категория с таким именем уже существует',
  isLearnCategory: 'Категория в режиме изучения',
  lowWordsInCategory: `Для начала изучения категории, она должна содержать не менее ${ALLOW_WORDS_TO_START_CATEGORY} слов`,
  hasWord: 'Добавляемое слово уже существует',
  hasRelevanceWord: 'Добавляемое слово уже существует в актуализаторе',
}
