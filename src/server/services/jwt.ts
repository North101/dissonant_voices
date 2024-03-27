import jwt from 'jwt-simple'
import { DateTime } from 'luxon'
import { Token } from 'simple-oauth2'
import config from '../config'

export interface JwtPayload {
  token: Token
  issued: number
}

export default class JwtService {
  encodeToken(token: Token) {
    const payload: JwtPayload = {
      token,
      issued: DateTime.utc().toMillis(),
    }
    return jwt.encode(payload, config.jwt.secret, config.jwt.algorithm)
  }

  decodeToken(token: string): JwtPayload {
    return jwt.decode(token, config.jwt.secret, false, config.jwt.algorithm)
  }
}
