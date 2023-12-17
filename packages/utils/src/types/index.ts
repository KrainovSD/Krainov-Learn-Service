export type TObject = Record<string, any>
export type Maybe<T> = T | undefined | null
export type DateType =
  | 'days'
  | 'months'
  | 'years'
  | 'seconds'
  | 'minutes'
  | 'hours'
export type DateGetterRule = {
  increment: number
  type: DateType
}
