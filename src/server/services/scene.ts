import fs from 'fs'
import path from 'path'
import config from '../config'
import SqliteDB from '../db'
import { mapToScene, Scene, SceneResult } from '../models/scene'

export default class SceneService {
  db: SqliteDB

  constructor(db: SqliteDB) {
    this.db = db
  }

  listScene(): Scene[] {
    return this.db.listSceneStmt.all().map(e => mapToScene(e as SceneResult))
  }

  listSceneByCampaignId(campaignId: string): Scene[] {
    return this.db.listSceneByCampaignIdStmt.all({ campaignId }).map(e => mapToScene(e as SceneResult))
  }

  listSceneByScenarioId(scenarioId: string): Scene[] {
    return this.db.listSceneByScenarioIdStmt.all({ scenarioId }).map(e => mapToScene(e as SceneResult))
  }

  getSceneById(sceneId: string): Scene | null {
    const result = this.db.getSceneByIdStmt.get({ id: sceneId }) as SceneResult | null
    if (!result) return null

    return mapToScene(result)
  }

  getSceneFilepath(scene: Scene): string {
    const filepath = path.join(
      config.assets.sceneAudioPath,
      `${scene.id}.${scene.ext}`
    )
    if (!path.isAbsolute(filepath) || !fs.existsSync(filepath)) {
      throw Error(`${filepath} not found`)
    }

    return filepath
  }
}
