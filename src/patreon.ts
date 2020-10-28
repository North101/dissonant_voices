import {
  create,
  ModuleOptions,
  OAuthClient,
  Token,
} from "simple-oauth2";
import { format as formatUrl } from "url";
import { PatreonRequest, Endpoints, Schemas } from "patreon-ts";

const PATREON_HOST = "https://www.patreon.com";
const PATREON_TOKEN_PATH = "/api/oauth2/token";
const PATREON_AUTHORIZE_PATH = "/oauth2/authorize";

const PATREON_REDIRECT_URL = formatUrl({
  protocol: process.env.PROTOCOL,
  host: process.env.HOST,
  pathname: process.env.REDIRECT_PATHNAME,
});
const PATREON_OAUTH_SCOPE = [
  "identity",
  "identity.memberships",
].join(" ");

const PATREON_CREDENTIALS: ModuleOptions = {
  client: {
    id: process.env.PATREON_CLIENT_ID as string,
    secret: process.env.PATREON_CLIENT_SECRET as string,
  },
  auth: {
    tokenHost: PATREON_HOST,
    tokenPath: PATREON_TOKEN_PATH,
    authorizePath: PATREON_AUTHORIZE_PATH,
  },
};

// Build the OAuth2 client.
const PATREON_CLIENT: OAuthClient<"patreon"> = create(PATREON_CREDENTIALS);

export const PATREON_AUTHORIZE_URL = PATREON_CLIENT.authorizationCode.authorizeURL({
  redirect_uri: PATREON_REDIRECT_URL,
  scope: PATREON_OAUTH_SCOPE,
});

export async function getAccessToken(code: string) {
  return await PATREON_CLIENT.authorizationCode.getToken({
    code,
    scope: PATREON_OAUTH_SCOPE,
    redirect_uri: PATREON_REDIRECT_URL,
  });
}

export async function getPatronStatus(token: Token) {
  const accessToken = PATREON_CLIENT.accessToken.create(token);

  const UserQueryObject: Schemas.User = new Schemas.User({
    relationships: {
      memberships: Schemas.user_constants.relationships?.memberships,
      "memberships.campaign": "memberships.campaign",
    } as any,
  });

  const endpointQuery = Endpoints.BuildEndpointQuery(
    UserQueryObject
  );
  endpointQuery["fields[member]"] = "patron_status";

  const query: string = Endpoints.BuildSimpleEndpoint(
    Endpoints.SimpleEndpoints.Identity,
    endpointQuery,
  );

  const result: UserMembership = JSON.parse(await PatreonRequest(accessToken, query));
  const isPatron = result.included.some(
    (rel) =>
      rel.type === "member" &&
      rel.attributes.patron_status === "active_patron" &&
      rel.relationships.campaign.data.id === process.env.PATRON_CAMPAIGN_ID
  );
  return {accessToken, isPatron};
}

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