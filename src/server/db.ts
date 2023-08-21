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

interface InsertToken {
  id: string
  token: string
  userId: string | null
  isPatron: number
  created: string
  lastChecked: string
}

interface UpdateToken {
  id: string
  token: string
  userId: string | null
  isPatron: number
  lastChecked: string
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

interface InsertUser {
  id: string
  name: string
  isAdmin: number
  overridePatronStatus: number
}

interface UpdateUser {
  id: string
  name: string
  isAdmin: number
  overridePatronStatus: number
}

interface InsertGrant {
  id: string
  expires: string
  isAdmin: number | null
  overridePatronStatus: number | null
}

export default class SqliteDB {
  db: Database.Database

  readonly insertTokenStmt: Database.Statement<InsertToken>
  readonly updateTokenStmt: Database.Statement<UpdateToken>
  readonly getTokenByIdStmt: Database.Statement<ById>
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
  readonly insertUserStmt: Database.Statement<InsertUser>
  readonly updateUserStmt: Database.Statement<UpdateUser>
  readonly getUserByIdStmt: Database.Statement<ById>
  readonly insertGrantStmt: Database.Statement<InsertGrant>
  readonly deleteGrantStmt: Database.Statement<ById>
  readonly getGrantByIdStmt: Database.Statement<ById>

  constructor(db: Database.Database) {
    this.db = db

    this.insertTokenStmt = db.prepare(`
      INSERT INTO token(id, token, user_id, is_patron, created, last_checked)
      VALUES (:id, :token, :userId, :isPatron, :created, :lastChecked)
    `)

    this.updateTokenStmt = db.prepare(`
      UPDATE token
      SET
        token = :token,
        user_id = :userId,
        is_patron = :isPatron,
        last_checked = :lastChecked
      WHERE token.id = :id
    `)

    this.getTokenByIdStmt = db.prepare(`
      SELECT *
      FROM token
      LEFT JOIN user
        ON user.id = token.user_id
      WHERE token.id = :id
    `).expand(true)

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

    this.insertUserStmt = db.prepare(`
      INSERT INTO user
      VALUES (:id, :name, :isAdmin, :overridePatronStatus)
    `)

    this.updateUserStmt = db.prepare(`
      UPDATE user
      SET
        name = :name,
        is_admin = :isAdmin,
        override_patron_status = :overridePatronStatus
      WHERE user.id = :id
    `)

    this.getUserByIdStmt = db.prepare(`
      SELECT *
      FROM user
      WHERE user.id = :id
    `).expand(true)

    this.insertGrantStmt = db.prepare(`
      INSERT INTO grant
      VALUES (:id, :expires, :isAdmin, :overridePatronStatus)
    `)

    this.deleteGrantStmt = db.prepare(`
      DELETE FROM grant
      WHERE grant.id = :id
    `)

    this.getGrantByIdStmt = db.prepare(`
      SELECT *
      FROM grant
      WHERE grant.id = :id
    `).expand(true)
  }
}
