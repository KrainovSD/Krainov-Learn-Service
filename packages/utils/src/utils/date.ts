import dayjs from 'dayjs'
import today from 'dayjs/plugin/isToday'
import { DateType, Maybe } from '../types'

dayjs.extend(today)

function isToday(date: Maybe<string>) {
  try {
    return dayjs(date).isToday()
  } catch {
    return false
  }
}

function getDate(increment: number, type: DateType) {
  const result = new Date()
  switch (type) {
    case 'days': {
      result.setDate(result.getDate() + increment)
      return result
    }
    case 'months': {
      result.setMonth(result.getMonth() + increment)
      return result
    }
    case 'years': {
      result.setFullYear(result.getFullYear() + increment)
      return result
    }
    case 'seconds': {
      result.setSeconds(result.getSeconds() + increment)
      return result
    }
    case 'minutes': {
      result.setMinutes(result.getMinutes() + increment)
      return result
    }
    case 'hours': {
      result.setHours(result.getHours() + increment)
      return result
    }
    default:
      return result
  }
}

export default {
  isToday,
  getDate,
}
