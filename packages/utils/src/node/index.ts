import crypto from 'crypto'
import { v4 as uuid4 } from 'uuid'

export function genUUID() {
  return uuid4()
}
