import { AccessToken, AuthorizationCode, ModuleOptions } from "simple-oauth2";
import { PatreonRequest, Endpoints, Schemas } from "patreon-ts";
import { CreatePatreonTokenFromOAuthToken } from "patreon-ts/dist/types";

import config from "../config";

interface UserMembership {
  data: {
    relationships: {
      campaign?: {
        data: {
          id: string;
        };
      };
    };
  };
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

const PATREON_CREDENTIALS: ModuleOptions<"patreon"> = {
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
  scope = ["identity", "identity.memberships", "campaigns"];

  constructor() {
    // Build the OAuth2 client.
    this.client = new AuthorizationCode<"patreon">(PATREON_CREDENTIALS);
  }

  getPatreonRedirectUrl(state: string, type: string) {
    return this.client.authorizeURL({
      redirect_uri: config.patreon.redirectUrl + (type ? `?type=${type}` : '' ),
      scope: this.scope,
      state,
    });
  }

  getAccessToken(code: string, type: string) {
    return this.client.getToken({
      redirect_uri: config.patreon.redirectUrl + (type ? `?type=${type}` : '' ),
      scope: this.scope,
      code,
    });
  }

  async getPatronStatus(accessToken: AccessToken) {
    const UserQueryObject = new Schemas.UserSchema({
      relationships: {
        memberships: Schemas.user_constants.relationships?.memberships,
        "memberships.campaign": "memberships.campaign",
        campaign: Schemas.user_constants.relationships.campaign,
      } as any,
    });

    const endpointQuery = Endpoints.BuildEndpointQuery(UserQueryObject);
    endpointQuery["fields[member]"] = "patron_status";

    const query: string = Endpoints.BuildSimpleEndpoint(
      Endpoints.SimpleEndpoints.Identity,
      endpointQuery
    );

    const result: UserMembership = JSON.parse(
      await PatreonRequest(CreatePatreonTokenFromOAuthToken(accessToken), query)
    );
    const isPatron = result.included.some(
      (rel) =>
        rel.type === "member" &&
        rel.attributes.patron_status === "active_patron" &&
        rel.relationships.campaign.data.id === config.patreon.campaignId
    ) || result.data.relationships.campaign?.data?.id === config.patreon.campaignId;
    return isPatron;
  }
}