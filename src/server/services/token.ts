import { DateTime } from 'luxon'
import { Token as Otoken } from 'simple-oauth2'
import { v4 as uuidv4 } from 'uuid'
import SqliteDB from '../db'
import { mapToToken, Token, TokenResult } from '../models/token'

export default class TokenService {
  db: SqliteDB

  constructor(db: SqliteDB) {
    this.db = db
  }

  createToken(
    token: Otoken,
    userId: string,
    isPatron: boolean,
  ) {
    const tokenId = uuidv4()
    const now = DateTime.utc().toSQL()!
    this.db.insertTokenStmt.run({
      id: tokenId,
      token: JSON.stringify(token),
      userId,
      isPatron: isPatron ? 1 : 0,
      created: now,
      lastChecked: now,
    })
    return tokenId
  }

  updateToken(
    tokenId: string,
    token: Otoken,
    userId: string,
    isPatron: boolean,
  ) {
    this.db.updateTokenStmt.run({
      id: tokenId,
      token: JSON.stringify(token),
      userId,
      isPatron: isPatron ? 1 : 0,
      lastChecked: DateTime.utc().toSQL()!,
    })
  }

  getTokenById(tokenId: string): Token | null {
    const result = this.db.getTokenByIdStmt.get({ id: tokenId }) as TokenResult | null
    if (!result) return null

    return mapToToken(result)
  }
}
