import dayjs from 'dayjs'
import today from 'dayjs/plugin/isToday'
import yesterday from 'dayjs/plugin/isYesterday'
import tomorrow from 'dayjs/plugin/isTomorrow'
import { DateGetterRule, DateType, Maybe } from '../types'

dayjs.extend(today)
dayjs.extend(yesterday)
dayjs.extend(tomorrow)

function isToday(date: Maybe<string | Date>) {
  try {
    return dayjs(date).isToday()
  } catch {
    return false
  }
}
function isYesterday(date: Maybe<string | Date>) {
  try {
    return dayjs(date).isYesterday()
  } catch {
    return false
  }
}
function isTomorrow(date: Maybe<string | Date>) {
  try {
    return dayjs(date).isTomorrow()
  } catch {
    return false
  }
}

function getDate(increment: number, type: DateType, date: Date = new Date()) {
  const result = date
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

function getDateByMultipleRule(rules: DateGetterRule[]) {
  let result = new Date()
  for (const rule of rules) {
    getDate(rule.increment, rule.type, result)
  }
  return result
}

function differenceDate(
  type: DateType,
  firstDate: Date,
  secondDate: Date = new Date(),
  float: boolean = false,
) {
  const first = dayjs(firstDate)
  return first.diff(secondDate, type, float)
}

function getTomorrow() {
  const tomorrow = new Date()
  tomorrow.setHours(0, 0, 0, 0)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow
}
function getYesterday() {
  const yesterday = new Date()
  yesterday.setHours(0, 0, 0, 0)
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday
}
function getToday() {
  const startNow = new Date()
  startNow.setHours(0, 0, 0, 0)
  const endNow = new Date()
  endNow.setHours(23, 59, 59, 999)
  return { startNow, endNow }
}

export default {
  isToday,
  isTomorrow,
  isYesterday,
  getDate,
  getDateByMultipleRule,
  differenceDate,
  getToday,
  getYesterday,
  getTomorrow,
}
