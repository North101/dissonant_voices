import SqliteDB from '../db'
import { mapToScenario, Scenario, ScenarioResult } from '../models/scenario'

export default class ScenarioService {
  db: SqliteDB

  constructor(db: SqliteDB) {
    this.db = db
  }

  listScenario(): Scenario[] {
    return this.db.listScenarioStmt.all().map(e => mapToScenario(e as ScenarioResult))
  }

  listScenarioByCampaignId(campaignId: string): Scenario[] {
    return this.db.listScenarioByCampaignIdStmt.all({ campaignId }).map(e => mapToScenario(e as ScenarioResult))
  }

  getScenarioById(scenarioId: string): Scenario | null {
    const result = this.db.getScenarioByIdStmt.get({ id: scenarioId }) as ScenarioResult | null
    if (!result) return null

    return mapToScenario(result)
  }
}
