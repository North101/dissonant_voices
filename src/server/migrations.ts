import { IMigration } from '@blackglory/better-sqlite3-migrations'
import { Database } from 'better-sqlite3'

const migration1: IMigration = {
  version: 1,
  up: (db: Database) => {
    db.exec(`
      CREATE TABLE user(
        id TEXT PRIMARY KEY,
        token TEXT NOT NULL,
        is_patron INT NOT NULL,
        created TEXT NOT NULL,
        last_checked TEXT NOT NULL
      );

      CREATE TABLE campaign(
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        'index' INT NOT NULL
      );

      CREATE TABLE scenario(
        id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        name TEXT NOT NULL,
        'index' INT NOT NULL
      );

      CREATE TABLE scene(
        id TEXT PRIMARY KEY,
        scenario_id TEXT NOT NULL,
        name TEXT NOT NULL,
        ext TEXT NOT NULL,
        'index' INT NOT NULL
      );
    `)
  },
  down: (db: Database) => {
    db.exec(`
      DROP TABLE user;

      DROP TABLE campaign;

      DROP TABLE scenario;

      DROP TABLE scene;
    `)
  },
}

const migration2: IMigration = {
  version: 2,
  up: (db: Database) => {
    db.exec(`
      CREATE TABLE token(
        id TEXT PRIMARY KEY,
        user_id TEXT,
        token TEXT NOT NULL,
        is_patron INT NOT NULL,
        created TEXT NOT NULL,
        last_checked TEXT NOT NULL
      );

      INSERT INTO token(id, token, is_patron, created, last_checked, user_id)
      SELECT user.*, NULL
      FROM user;

      DROP TABLE user;

      CREATE TABLE user(
        id TEXT PRIMARY KEY,
        name TEXT TEXT NOT NULL,
        is_admin INT NOT NULL,
        override_patron_status INT NOT NULL
      );

      CREATE TABLE grant(
        id TEXT PRIMARY KEY,
        expires TEXT NOT NULL,
        is_admin INT,
        override_patron_status INT
      );
    `)
  },
  down: (db: Database) => {
    db.exec(`
      DROP TABLE grant;

      DROP TABLE user;

      CREATE TABLE user(
        id TEXT PRIMARY KEY,
        token TEXT NOT NULL,
        is_patron INT NOT NULL,
        created TEXT NOT NULL,
        last_checked TEXT NOT NULL
      );

      INSERT INTO user(id, token, is_patron, created, last_checked)
      SELECT id, token, is_patron, created, last_checked
      FROM token;

      DROP TABLE token'
    `)
  },
}

export default <IMigration[]>[
  migration1,
  migration2,
]
