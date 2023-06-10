import dayjs from 'dayjs'
import today from 'dayjs/plugin/isToday'

export type Maybe<T> = T | undefined | null

dayjs.extend(today)

export function isToday(date: Maybe<string>) {
  return dayjs(date).isToday()
}
