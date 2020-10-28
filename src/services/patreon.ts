import { AccessToken, AuthorizationCode, ModuleOptions, Token } from "simple-oauth2";
import { format as formatUrl } from "url";
import { PatreonRequest, Endpoints, Schemas } from "patreon-ts";
import config from "../config";

interface UserMembership {
  included: {
    id: string;
    type: string;
    attributes: {
      patron_status: string;
    };
    relationships: {
      campaign: {
        data: {
          id: string;
          type: string;
        };
      };
    };
  }[];
}

const PATREON_CREDENTIALS: ModuleOptions = {
  client: {
    id: config.patreon.clientId,
    secret: config.patreon.clientSecret,
  },
  auth: {
    tokenHost: config.patreon.host,
    tokenPath: config.patreon.tokenPath,
    authorizePath: config.patreon.authorizePath,
  },
};

export default class PatreonService {
  client: AuthorizationCode<"patreon">;
  scope = ["identity", "identity.memberships"];

  constructor() {
    // Build the OAuth2 client.
    this.client = new AuthorizationCode(PATREON_CREDENTIALS);
  }

  getPatreonRedirectUrl(state: string) {
    return this.client.authorizeURL({
      redirect_uri: config.patreon.redirectUrl,
      scope: this.scope,
      state,
    });
  }

  getAccessToken(code: string) {
    return this.client.getToken({
      redirect_uri: config.patreon.redirectUrl,
      scope: this.scope,
      code,
    });
  }

  async getPatronStatus(accessToken: AccessToken) {
    const UserQueryObject: Schemas.User = new Schemas.User({
      relationships: {
        memberships: Schemas.user_constants.relationships?.memberships,
        "memberships.campaign": "memberships.campaign",
      } as any,
    });

    const endpointQuery = Endpoints.BuildEndpointQuery(UserQueryObject);
    endpointQuery["fields[member]"] = "patron_status";

    const query: string = Endpoints.BuildSimpleEndpoint(
      Endpoints.SimpleEndpoints.Identity,
      endpointQuery
    );

    const result: UserMembership = JSON.parse(
      await PatreonRequest(accessToken, query)
    );
    const isPatron = result.included.some(
      (rel) =>
        rel.type === "member" &&
        rel.attributes.patron_status === "active_patron" &&
        rel.relationships.campaign.data.id === config.patreon.campaignId
    );
    return isPatron;
  }
}