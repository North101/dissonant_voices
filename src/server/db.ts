import Database from 'better-sqlite3'

interface ById {
  id: string
}

interface ByCampaignId {
  campaignId: string
}

interface ByScenarioId {
  scenarioId: string
}

interface InsertCampaign {
  id: string
  name: string
  index: number
}

interface InsertScenario {
  id: string
  name: string
  index: number
  campaignId: string
}

interface InsertScene {
  id: string
  name: string
  ext: string
  index: number
  scenarioId: string
}

export default class SqliteDB {
  db: Database.Database

  readonly insertCampaignStmt: Database.Statement<InsertCampaign>
  readonly listCampaignStmt: Database.Statement
  readonly getCampaignByIdStmt: Database.Statement<ById>
  readonly insertScenarioStmt: Database.Statement<InsertScenario>
  readonly listScenarioStmt: Database.Statement
  readonly listScenarioByCampaignIdStmt: Database.Statement<ByCampaignId>
  readonly getScenarioByIdStmt: Database.Statement<ById>
  readonly insertSceneStmt: Database.Statement<InsertScene>
  readonly listSceneStmt: Database.Statement
  readonly listSceneByCampaignIdStmt: Database.Statement<ByCampaignId>
  readonly listSceneByScenarioIdStmt: Database.Statement<ByScenarioId>
  readonly getSceneByIdStmt: Database.Statement<ById>

  constructor(db: Database.Database) {
    this.db = db

    this.insertCampaignStmt = db.prepare(`
      INSERT INTO campaign
      VALUES (:id, :name, :index)
    `)

    this.listCampaignStmt = db.prepare(`
      SELECT *
      FROM campaign
    `).expand(true)

    this.getCampaignByIdStmt = db.prepare(`
      SELECT *
      FROM campaign
      WHERE campaign.id = :id
      ORDER BY campaign.'index'
    `).expand(true)

    this.insertScenarioStmt = db.prepare(`
      INSERT INTO scenario
      VALUES(:id, :campaignId, :name, :index)
    `)

    this.listScenarioStmt = db.prepare(`
      SELECT *
      FROM scenario
      INNER JOIN campaign
        ON campaign.id = scenario.campaign_id
      ORDER BY campaign.'index', scenario.'index'
    `).expand(true)

    this.listScenarioByCampaignIdStmt = db.prepare(`
      SELECT *
      FROM scenario
      INNER JOIN campaign
        ON campaign.id = scenario.campaign_id
      WHERE campaign.id = :campaignId
      ORDER BY campaign.'index', scenario.'index'
    `).expand(true)

    this.getScenarioByIdStmt = db.prepare(`
      SELECT *
      FROM scenario
      INNER JOIN campaign
        ON campaign.id = scenario.campaign_id
      WHERE scenario.id = :id
    `).expand(true)

    this.insertSceneStmt = db.prepare(`
      INSERT INTO scene
      VALUES(:id, :scenarioId, :name, :ext, :index)
    `)

    this.listSceneStmt = db.prepare(`
      SELECT *
      FROM scene
      INNER JOIN scenario
        ON scenario.id = scene.scenario_id
      INNER JOIN campaign
        ON campaign.id = scenario.campaign_id
      ORDER BY campaign.'index', scenario.'index', scene.'index'
    `).expand(true)

    this.listSceneByCampaignIdStmt = db.prepare(`
      SELECT *
      FROM scene
      INNER JOIN scenario
        ON scenario.id = scene.scenario_id
      INNER JOIN campaign
        ON campaign.id = scenario.campaign_id
      WHERE campaign.id = :campaignId
      ORDER BY campaign.'index', scenario.'index', scene.'index'
    `).expand(true)

    this.listSceneByScenarioIdStmt = db.prepare(`
      SELECT *
      FROM scene
      INNER JOIN scenario
        ON scenario.id = scene.scenario_id
      INNER JOIN campaign
        ON campaign.id = scenario.campaign_id
      WHERE scenario.id = :scenarioId
      ORDER BY campaign.'index', scenario.'index', scene.'index'
    `).expand(true)

    this.getSceneByIdStmt = db.prepare(`
      SELECT *
      FROM scene
      INNER JOIN scenario
        ON scenario.id = scene.scenario_id
      INNER JOIN campaign
        ON campaign.id = scenario.campaign_id
      WHERE scene.id = :id
    `).expand(true)
  }
}
