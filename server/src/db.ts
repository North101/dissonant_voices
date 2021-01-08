import BetterSqlite3 from "better-sqlite3";

interface ById {
  id: string;
}

interface ByCampaignId {
  campaignId: string;
}

interface ByScenarioId {
  scenarioId: string;
}

interface InsertUser {
  id: string;
  token: string;
  isPatron: number;
  created: string;
  lastChecked: string;
}

interface UpdateUser {
  id: string;
  token: string;
  isPatron: number;
  lastChecked: string;
}

interface InsertCampaign {
  id: string;
  name: string;
  index: number;
}

interface InsertScenario {
  id: string;
  name: string;
  index: number;
  campaignId: string;
}

interface InsertScene {
  id: string;
  name: string;
  ext: string;
  index: number;
  scenarioId: string;
}

export default class SqliteDB {
  db: BetterSqlite3.Database;

  insertUserStmt: BetterSqlite3.Statement<InsertUser>;
  updateUserStmt: BetterSqlite3.Statement<UpdateUser>;
  getUserByIdStmt: BetterSqlite3.Statement<ById>;
  insertCampaignStmt: BetterSqlite3.Statement<InsertCampaign>;
  listCampaignStmt: BetterSqlite3.Statement;
  getCampaignByIdStmt: BetterSqlite3.Statement<ById>;
  insertScenarioStmt: BetterSqlite3.Statement<InsertScenario>;
  listScenarioStmt: BetterSqlite3.Statement;
  listScenarioByCampaignIdStmt: BetterSqlite3.Statement<ByCampaignId>;
  getScenarioByIdStmt: BetterSqlite3.Statement<ById>;
  insertSceneStmt: BetterSqlite3.Statement<InsertScene>;
  listSceneStmt: BetterSqlite3.Statement;
  listSceneByCampaignIdStmt: BetterSqlite3.Statement<ByCampaignId>;
  listSceneByScenarioIdStmt: BetterSqlite3.Statement<ByScenarioId>;
  getSceneByIdStmt: BetterSqlite3.Statement<ById>;

  constructor(db: BetterSqlite3.Database) {
    this.db = db;

    this.insertUserStmt = db.prepare(`
      INSERT INTO user
      VALUES (:id, :token, :isPatron, :created, :lastChecked)
    `);

    this.updateUserStmt = db.prepare(`
      UPDATE user
      SET
        token = :token,
        is_patron = :isPatron,
        last_checked = :lastChecked
      WHERE user.id = :id
    `);

    this.getUserByIdStmt = db.prepare(`
      SELECT *
      FROM user
      WHERE user.id = :id
    `).expand(true);

    this.insertCampaignStmt = db.prepare(`
      INSERT INTO campaign
      VALUES (:id, :name, :index)
    `);

    this.listCampaignStmt = db.prepare(`
      SELECT *
      FROM campaign
    `).expand(true);

    this.getCampaignByIdStmt = db.prepare(`
      SELECT *
      FROM campaign
      WHERE campaign.id = :id
      ORDER BY campaign."index"
    `).expand(true);

    this.insertScenarioStmt = db.prepare(`
      INSERT INTO scenario
      VALUES(:id, :campaignId, :name, :index)
    `);

    this.listScenarioStmt = db.prepare(`
      SELECT *
      FROM scenario
      INNER JOIN campaign
        ON campaign.id = scenario.campaign_id
      ORDER BY campaign."index", scenario."index"
    `).expand(true);

    this.listScenarioByCampaignIdStmt = db.prepare(`
      SELECT *
      FROM scenario
      INNER JOIN campaign
        ON campaign.id = scenario.campaign_id
      WHERE campaign.id = :campaignId
      ORDER BY campaign."index", scenario."index"
    `).expand(true);

    this.getScenarioByIdStmt = db.prepare(`
      SELECT *
      FROM scenario
      INNER JOIN campaign
        ON campaign.id = scenario.campaign_id
      WHERE scenario.id = :id
    `).expand(true);

    this.insertSceneStmt = db.prepare(`
      INSERT INTO scene
      VALUES(:id, :scenarioId, :name, :ext, :index)
    `);

    this.listSceneStmt = db.prepare(`
      SELECT *
      FROM scene
      INNER JOIN scenario
        ON scenario.id = scene.scenario_id
      INNER JOIN campaign
        ON campaign.id = scenario.campaign_id
      ORDER BY campaign."index", scenario."index", scene."index"
    `).expand(true);

    this.listSceneByCampaignIdStmt = db.prepare(`
      SELECT *
      FROM scene
      INNER JOIN scenario
        ON scenario.id = scene.scenario_id
      INNER JOIN campaign
        ON campaign.id = scenario.campaign_id
      WHERE campaign.id = :campaignId
      ORDER BY campaign."index", scenario."index", scene."index"
    `).expand(true);

    this.listSceneByScenarioIdStmt = db.prepare(`
      SELECT *
      FROM scene
      INNER JOIN scenario
        ON scenario.id = scene.scenario_id
      INNER JOIN campaign
        ON campaign.id = scenario.campaign_id
      WHERE scenario.id = :scenarioId
      ORDER BY campaign."index", scenario."index", scene."index"
    `).expand(true);

    this.getSceneByIdStmt = db.prepare(`
      SELECT *
      FROM scene
      INNER JOIN scenario
        ON scenario.id = scene.scenario_id
      INNER JOIN campaign
        ON campaign.id = scenario.campaign_id
      WHERE scene.id = :id
    `).expand(true);
  }
}
