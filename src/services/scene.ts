import fs from "fs";
import path from "path";

import SqliteDB from "../db";
import config from "../config";
import { mapToScene, Scene } from "../models/scene";

export default class SceneService {
  db: SqliteDB;

  constructor(db: SqliteDB) {
    this.db = db;
  }

  listScene(): Scene[] {
    return this.db.listSceneStmt.all().map(mapToScene);
  }

  listSceneByCampaignId(campaignId: string): Scene[] {
    return this.db.listSceneByCampaignIdStmt.all({ campaignId }).map(mapToScene);
  }

  listSceneByScenarioId(scenarioId: string): Scene[] {
    return this.db.listSceneByScenarioIdStmt.all({ scenarioId }).map(mapToScene);
  }

  getSceneById(sceneId: string): Scene | null {
    const result = this.db.getSceneByIdStmt.get({ id: sceneId });
    if (!result) return null;

    return mapToScene(result);
  }

  getSceneFilepath(scene: Scene): string {
    const filepath = path.join(
      config.assets.sceneAudioPath,
      `${scene.id}.${scene.ext}`
    );
    console.log(filepath);
    if (!path.isAbsolute(filepath) || !fs.existsSync(filepath)) {
      throw Error();
    }

    return filepath;
  }
}
