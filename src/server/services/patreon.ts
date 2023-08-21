import { Endpoints, PatreonRequest, Schemas } from 'patreon-ts'
import { UserRelationships } from 'patreon-ts/dist/schemas/user'
import { CreatePatreonTokenFromOAuthToken } from 'patreon-ts/dist/types'
import { AccessToken, AuthorizationCode, ModuleOptions } from 'simple-oauth2'
import config from '../config'

interface UserMembership {
  data: {
    id: string
    attributes: {
      full_name: string
    },
    relationships: {
      campaign?: {
        data: {
          id: string
        }
      }
    }
  }
  included?: {
    id: string
    type: string
    attributes: {
      patron_status: string
    }
    relationships: {
      campaign: {
        data: {
          id: string
          type: string
        }
      }
    }
  }[]
}

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
      redirect_uri: config.patreon.redirectUrl + (clientId ? `?client_id=${clientId}` : '' ),
      scope: this.scope,
      state,
    })
  }

  getAccessToken(code: string, clientId: string) {
    return this.client.getToken({
      redirect_uri: config.patreon.redirectUrl + (clientId ? `?client_id=${clientId}` : '' ),
      scope: this.scope,
      code,
    })
  }

  async getPatronInfo(accessToken: AccessToken) {
    const UserQueryObject = new Schemas.UserSchema({
      attributes: {
        full_name: Schemas.user_constants.attributes.full_name,
      },
      relationships: {
        memberships: Schemas.user_constants.relationships?.memberships,
        'memberships.campaign': 'memberships.campaign',
        campaign: Schemas.user_constants.relationships.campaign,
      } as UserRelationships,
    })

    const endpointQuery = Endpoints.BuildEndpointQuery(UserQueryObject)
    endpointQuery['fields[member]'] = 'patron_status'

    const query: string = Endpoints.BuildSimpleEndpoint(
      Endpoints.SimpleEndpoints.Identity,
      endpointQuery
    )

    const result: UserMembership = JSON.parse(
      await PatreonRequest(CreatePatreonTokenFromOAuthToken(accessToken), query)
    )
    const patreonUserId = result.data.id
    const name = result.data.attributes.full_name
    const isPatron = (result.included?.some(
      (rel) =>
        rel.type === 'member' &&
        rel.attributes.patron_status === 'active_patron' &&
        rel.relationships.campaign.data.id === config.patreon.campaignId
    ) ?? false) || result.data.relationships.campaign?.data?.id === config.patreon.campaignId
    return {
      patreonUserId,
      name,
      isPatron,
    }
  }
}
