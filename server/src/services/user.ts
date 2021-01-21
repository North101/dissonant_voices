import SqliteDB from '../db';
import { mapToUser, User } from '../models/user';

export default class UserService {
  db: SqliteDB;

  constructor(db: SqliteDB) {
    this.db = db;
  }

  createUser(
    userId: string,
    name: string,
    isAdmin: boolean,
    overridePatronStatus: boolean,
  ) {
    this.db.insertUserStmt.run({
      id: userId,
      name: name,
      isAdmin: isAdmin ? 1 : 0,
      overridePatronStatus: overridePatronStatus ? 1 : 0,
    });
    return userId;
  }

  updateUser(
    userId: string,
    name: string,
    isAdmin: boolean,
    overridePatronStatus: boolean,
  ) {
    this.db.updateUserStmt.run({
      id: userId,
      name: name,
      isAdmin: isAdmin ? 1 : 0,
      overridePatronStatus: overridePatronStatus ? 1 : 0,
    });
  }

  getUserById(userId: string): User | null {
    const result = this.db.getUserByIdStmt.get({ id: userId });
    if (!result) return null;

    return mapToUser(result);
  }
}
