import config from "../config";
import SqliteDB from "../db";
import CampaignService from "../services/campaign";
import JwtService from "../services/jwt";
import PatreonService from "../services/patreon";
import ScenarioService from "../services/scenario";
import SceneService from "../services/scene";
import UserService from "../services/user";

export interface Services {
  campaign: CampaignService,
  scenario: ScenarioService,
  scene: SceneService,
  user: UserService,
  patreon: PatreonService,
  jwt: JwtService,
}

export default ({ db }: { db: SqliteDB }): Services => {
  console.log(new JwtService().encodeAdminToken(config.adminId))
  return {
    campaign: new CampaignService(db),
    scenario: new ScenarioService(db),
    scene: new SceneService(db),
    user: new UserService(db),
    patreon: new PatreonService(),
    jwt: new JwtService(),
  };
};
