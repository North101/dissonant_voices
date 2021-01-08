import { DateTime } from "luxon";
import { Token } from "simple-oauth2";
import * as uuid from "uuid";

import SqliteDB from "../db";
import { mapToUser, User } from "../models/user";

export default class UserService {
  db: SqliteDB;

  constructor(db: SqliteDB) {
    this.db = db;
  }

  createUser(
    token: Token,
    isPatron: boolean,
  ) {
    const userId = uuid.v4();
    const now = DateTime.utc().toSQL();
    this.db.insertUserStmt.run({
      id: userId,
      token: JSON.stringify(token),
      isPatron: isPatron ? 1 : 0,
      created: now,
      lastChecked: now,
    });
    return userId;
  }

  updateUser(
    userId: string,
    token: Token,
    isPatron: boolean,
  ) {
    this.db.updateUserStmt.run({
      id: userId,
      token: JSON.stringify(token),
      isPatron: isPatron ? 1 : 0,
      lastChecked: DateTime.utc().toSQL(),
    });
  }

  getUserById(userId: string): User | null {
    const result = this.db.getUserByIdStmt.get({ id: userId });
    if (!result) return null;

    return mapToUser(result);
  }
}
