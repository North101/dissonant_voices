import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

import SqliteDB from '../db';
import { mapToGrant, Grant } from '../models/grant';

export default class UserService {
  db: SqliteDB;

  constructor(db: SqliteDB) {
    this.db = db;
  }

  createGrant(
    isAdmin: boolean | null,
    overridePatronStatus: boolean | null,
  ) {
    const grantId = uuidv4();
    const expires = DateTime.utc().plus({ days: 1 });
    this.db.insertGrantStmt.run({
      id: grantId,
      expires: expires.toSQL(),
      isAdmin: isAdmin === null ? null : (isAdmin ? 1 : 0),
      overridePatronStatus: overridePatronStatus === null ? null : (overridePatronStatus ? 1 : 0),
    });
    return grantId;
  }

  deleteGrantById(
    grantId: string,
  ) {
    this.db.deleteGrantStmt.run({
      id: grantId,
    });
  }

  getGrantById(grantId: string): Grant | null {
    const result = this.db.getGrantByIdStmt.get({ id: grantId });
    if (!result) return null;

    return mapToGrant(result);
  }
}
