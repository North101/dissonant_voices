import { migrate } from "@blackglory/better-sqlite3-migrations";
import BetterSqlite3 from "better-sqlite3";

import config from "../config";
import SqliteDB from "../db";
import dbData from "../db.json";
import migrations from "../migrations";
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
  const userVersion = exists ? db.pragma('user_version', { simple: true }) : null;
  if (userVersion === 0) {
    db.pragma('user_version = 1');
  }

  const sqliteDB = db.transaction(() => {
    migrate(db, migrations);

    // purge data from campaign, scenario and scene table
    db.exec(`DELETE FROM scene`);
    db.exec(`DELETE FROM scenario`);
    db.exec(`DELETE FROM campaign`);

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
    }

    return sqliteDB;
  })();

  if (config.assets.verifySceneAudioExists) {
    console.log('verifySceneAudioExists');
    const sceneService = new SceneService(sqliteDB);
    const scenes = sceneService.listScene();
    for (const scene of scenes) {
      try {
        sceneService.getSceneFilepath(scene);
      } catch (e: any) {
        console.error(e.message);
      }
    }
  }

  return sqliteDB;
};
