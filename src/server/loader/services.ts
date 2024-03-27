import SqliteDB from '../db'
import CampaignService from '../services/campaign'
import JwtService from '../services/jwt'
import PatreonService from '../services/patreon'
import ScenarioService from '../services/scenario'
import SceneService from '../services/scene'

export interface Services {
  campaign: CampaignService,
  scenario: ScenarioService,
  scene: SceneService,

  patreon: PatreonService,
  jwt: JwtService,
}

export default ({ db }: { db: SqliteDB }): Services => {
  return {
    campaign: new CampaignService(db),
    scenario: new ScenarioService(db),
    scene: new SceneService(db),
    patreon: new PatreonService(),
    jwt: new JwtService(),
  }
}
