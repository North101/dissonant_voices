import SqliteDB from "../db";
import CampaignService from "../services/campaign";
import JwtService from "../services/jwt";
import PatreonService from "../services/patreon";
import PatreonUserService from "../services/user";
import ScenarioService from "../services/scenario";
import SceneService from "../services/scene";
import TokenService from "../services/token";
import GrantService from "../services/grant";

export interface Services {
  token: TokenService,
  user: PatreonUserService,
  grant: GrantService,

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
    token: new TokenService(db),
    user: new PatreonUserService(db),
    grant: new GrantService(db),
    patreon: new PatreonService(),
    jwt: new JwtService(),
  };
};
