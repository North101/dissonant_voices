import { IMigration } from '@blackglory/better-sqlite3-migrations'
import { Database } from 'better-sqlite3'

const migration1: IMigration = {
  version: 1,
  up: (db: Database) => {
    db.exec(`
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
      DROP TABLE campaign;

      DROP TABLE scenario;

      DROP TABLE scene;
    `)
  },
}

export default <IMigration[]>[
  migration1,
]
