import * as crypto from 'crypto'

export const objToHash = <T>(obj: T) =>
  crypto
    .createHash('md5')
    .update(JSON.stringify(obj))
    .digest('hex')
