import { migrate } from '@blackglory/better-sqlite3-migrations'
import Database from 'better-sqlite3'
import config from '../config'
import dbData from '../data.json'
import SqliteDB from '../db'
import migrations from '../migrations'
import SceneService from '../services/scene'

const initDatabase = () => new Database(':memory:')

export default () => {
  const db = initDatabase()

  const sqliteDB = db.transaction(() => {
    migrate(db, migrations)

    const sqliteDB = new SqliteDB(db)
    for (const [campaignIndex, campaign] of dbData.entries()) {
      const campaignId = campaign.id
      sqliteDB.insertCampaignStmt.run({
        id: campaignId,
        name: campaign.name,
        index: campaignIndex,
      })
      for (const [scenarioIndex, scenario] of campaign.scenarios.entries()) {
        const scenarioId = `${campaignId}.${scenario.id}`
        sqliteDB.insertScenarioStmt.run({
          id: scenarioId,
          name: scenario.name,
          index: scenarioIndex,
          campaignId,
        })
        for (const [sceneIndex, scene] of scenario.scenes.entries()) {
          const sceneId = `${scenarioId}.${scene.id}`
          sqliteDB.insertSceneStmt.run({
            id: sceneId,
            name: scene.name,
            ext: 'mp3',
            index: sceneIndex,
            scenarioId,
          })
        }
      }
    }

    return sqliteDB
  })()

  if (config.assets.verifySceneAudioExists) {
    console.log('verifySceneAudioExists')
    const sceneService = new SceneService(sqliteDB)
    const scenes = sceneService.listScene()
    for (const scene of scenes) {
      try {
        sceneService.getSceneFilepath(scene)
      } catch (e) {
        console.error((e as Error).message)
      }
    }
  }

  return sqliteDB
}
