import fs from "fs";
import BetterSqlite3 from "better-sqlite3";

import config from "../config";
import SqliteDB from "../db";
import dbData from "../db.json";
import SceneService from "../services/scene";

function initDatabase(path: string) {
  try {
    return { db: BetterSqlite3(path, { fileMustExist: true }), exists: true };
  } catch (e) {
    console.log(e);
    return { db: BetterSqlite3(path), exists: false };
  }
}

export default () => {
  const { db, exists } = initDatabase(config.db.path ?? ":memory:");
  if (db.memory || !exists) {
    // create user table
    db.prepare(`
      CREATE TABLE user(
        id TEXT PRIMARY KEY,
        token TEXT NOT NULL,
        is_patron INT NOT NULL,
        created TEXT NOT NULL,
        last_checked TEXT NOT NULL
      )
    `).run();
  } else {
    db.prepare(`DROP TABLE campaign`).run();
    db.prepare(`DROP TABLE scenario`).run();
    db.prepare(`DROP TABLE scene`).run();
  }

  // create campaign table
  db.prepare(`
    CREATE TABLE campaign(
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      "index" INT NOT NULL
    )
  `).run();

  // create scenario table
  db.prepare(`
    CREATE TABLE scenario(
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      name TEXT NOT NULL,
      "index" INT NOT NULL
    )
  `).run();

  // create scene table
  db.prepare(`
    CREATE TABLE scene(
      id TEXT PRIMARY KEY,
      scenario_id TEXT NOT NULL,
      name TEXT NOT NULL,
      ext TEXT NOT NULL,
      "index" INT NOT NULL
    )
  `).run();

  const sqliteDB = new SqliteDB(db);
  for (const [campaignIndex, campaign] of dbData.entries()) {
    const campaignId = campaign.id;
    sqliteDB.insertCampaignStmt.run({
      id: campaignId,
      name: campaign.name,
      index: campaignIndex,
    });
    for (const [scenarioIndex, scenario] of campaign.scenarios.entries()) {
      const scenarioId = `${campaignId}.${scenario.id}`;
      sqliteDB.insertScenarioStmt.run({
        id: scenarioId,
        name: scenario.name,
        index: scenarioIndex,
        campaignId,
      });
      for (const [sceneIndex, scene] of scenario.scenes.entries()) {
        const sceneId = `${scenarioId}.${scene.id}`;
        sqliteDB.insertSceneStmt.run({
          id: sceneId,
          name: scene.name,
          ext: "mp3",
          index: sceneIndex,
          scenarioId,
        });
      }
    }

    if (config.assets.verifySceneAudioExists) {
      console.log('verifySceneAudioExists');
      const sceneService = new SceneService(sqliteDB);
      const scenes = sceneService.listScene();
      for (const scene of scenes) {
        try {
          sceneService.getSceneFilepath(scene);
        } catch (e) {
          console.log(e);
        }
      }
    }
  }

  return sqliteDB;
};
