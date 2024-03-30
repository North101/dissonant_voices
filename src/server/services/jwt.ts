import jwt from 'jwt-simple'
import { Token } from 'simple-oauth2'
import config from '../config'

export interface JwtPayload {
  token: Token
}

export default class JwtService {
  encodeToken(token: Token) {
    const payload: JwtPayload = {
      token,
    }
    return jwt.encode(payload, config.jwt.secret, config.jwt.algorithm)
  }

  decodeToken(token: string): JwtPayload {
    return jwt.decode(token, config.jwt.secret, false, config.jwt.algorithm)
  }
}
