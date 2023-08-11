import crypto from 'crypto'
import { v4 as uuid4 } from 'uuid'

function genUUID() {
  return uuid4()
}

export default {
  genUUID,
}
