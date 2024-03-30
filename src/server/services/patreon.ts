import { Endpoints, Schemas, Types } from 'patreon-ts'
import { AccessToken, AuthorizationCode, ModuleOptions } from 'simple-oauth2'
import config from '../config'
import { Cacheable } from 'typescript-cacheable'

const fetchIdentity = Endpoints.identity(new Schemas.UserSchema({
  attributes: {
    full_name: true,
  },
  relationships: {
    memberships: new Schemas.MemberSchema({
      attributes: {
        patron_status: true,
      },
      relationships: {
        campaign: new Schemas.CampaignSchema(),
      },
    }),
  },
}))

const PATREON_CREDENTIALS: ModuleOptions<'patreon'> = {
  client: {
    id: config.patreon.clientId,
    secret: config.patreon.clientSecret,
  },
  auth: {
    tokenHost: config.patreon.host,
    tokenPath: config.patreon.tokenPath,
    authorizePath: config.patreon.authorizePath,
  },
}

export default class PatreonService {
  client: AuthorizationCode<'patreon'>
  scope = ['identity', 'identity.memberships', 'campaigns']

  constructor() {
    // Build the OAuth2 client.
    this.client = new AuthorizationCode<'patreon'>(PATREON_CREDENTIALS)
  }

  getPatreonRedirectUrl(state: string, clientId: string) {
    return this.client.authorizeURL({
      redirect_uri: config.patreon.redirectUrl + (clientId ? `?client_id=${clientId}` : ''),
      scope: this.scope,
      state,
    })
  }

  getAccessToken(code: string, clientId: string) {
    return this.client.getToken({
      redirect_uri: config.patreon.redirectUrl + (clientId ? `?client_id=${clientId}` : ''),
      scope: this.scope,
      code,
    })
  }

  //@Cacheable({ ttl: 5 * 60 * 1000 })
  async getPatronInfo(accessToken: AccessToken) {
    const result = await fetchIdentity(Types.toPatreonToken(accessToken))
    console.log(result)
    const patreonUserId = result.data.id
    const name = result.data.attributes?.full_name!
    const isPatron = (result.included.some(
      (rel) =>
        rel.type === 'member' &&
        rel.attributes?.patron_status === 'active_patron' &&
        rel.relationships?.campaign?.data.id === config.patreon.campaignId
    ) ?? false) || result.data.relationships?.campaign?.data.id === config.patreon.campaignId
    return {
      patreonUserId,
      name,
      isPatron,
    }
  }
}
