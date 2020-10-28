import SqliteDB from "../db";
import { mapToScenario, Scenario } from "../models/scenario";

export default class ScenarioService {
  db: SqliteDB;

  constructor(db: SqliteDB) {
    this.db = db;
  }

  listScenario(): Scenario[] {
    return this.db.listScenarioStmt.all().map(mapToScenario);
  }

  listScenarioByCampaignId(campaignId: string): Scenario[] {
    return this.db.listScenarioByCampaignIdStmt.all({ campaignId }).map(mapToScenario);
  }

  getScenarioById(scenarioId: string): Scenario | null {
    const result = this.db.getScenarioByIdStmt.get({ id: scenarioId });
    if (!result) return null;

    return mapToScenario(result);
  }
}
