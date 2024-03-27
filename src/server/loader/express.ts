import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { Validator } from 'express-json-validator-middleware'
import { JSONSchema7 } from 'json-schema'
import { DateTime } from 'luxon'
import { AccessToken } from 'simple-oauth2'
import url2 from 'url'

import { checkIsAdmin, checkIsPatron, Token } from '../models/token'
import * as jwt from '../services/jwt'
import { Services } from './services'

interface IToken {
  token: string
}

const token: JSONSchema7 = {
  type: 'object',
  properties: {
    client_id: {
      type: 'string',
    },
    code: {
      type: 'string',
    },
  },
}

const createGrant: JSONSchema7 = {
  type: 'object',
  properties: {
    is_admin: {
      type: 'boolean',
    },
    override_patron_status: {
      type: 'boolean',
    },
  },
}

export default async ({
  app,
  services,
}: {
  app: express.Application
  services: Services
}) => {
  const validator = new Validator({allErrors: true})
  const validate = validator.validate

  app.use(cors())
  app.use(cookieParser())
  app.use(express.json())

  app.get('/api/authorize', (req, res) => {
    const { state, client_id } = req.query
    return res.redirect(services.patreon.getPatreonRedirectUrl(state as string, client_id as string))
  })
  app.get('/api/redirect', asyncHandler(async (req, res) => {
    const parsedUrl = url2.parse(req.url, true)
    if (parsedUrl.query.client_id === 'arkhamcards') {
      parsedUrl.query.access_token = parsedUrl.query.code
      delete parsedUrl.query.code
      res.redirect(url2.format({
        protocol: 'arkhamcards',
        slashes: true,
        host: 'dissonantvoices',
        pathname: 'redirect',
        query: parsedUrl.query,
      }))
      return
    }
    res.status(200).json({
      message: 'success',
    }).end()
  }))
  app.post('/api/token', validate({body: token}), asyncHandler(async (req, res) => {
    const { client_id, code }: { client_id: string, code: string } = req.body
    let accessToken: AccessToken
    try {
      accessToken = await services.patreon.getAccessToken(code, client_id)
    } catch (e) {
      console.error(e)
      res.status(401).json({
        message: 'Invalid code',
      }).end()
      return
    }
    const { patreonUserId, isPatron } = await services.patreon.getPatronInfo(accessToken)
    const userId = services.token.createToken(accessToken.token, patreonUserId, isPatron)
    const user = services.token.getTokenById(userId)
    if (user === null) {
      res.status(500).end()
      return
    }

    res.json({
      token: services.jwt.encodeToken(userId),
      user_id: user.id,
      is_admin: checkIsAdmin(user),
      is_patron: checkIsPatron(user),
    }).end()
  }))
  app.get('/api/verify', checkToken, asyncHandler(async (req, res) => {
    let payload: jwt.JwtPayload
    try {
      payload = services.jwt.decodeToken((req as unknown as IToken).token)
    } catch (e) {
      console.error(e)
      res.sendStatus(400).end()
      return
    }

    const user = await getAuthUser(services, payload)
    if (user === null) {
      res.sendStatus(403).end()
      return
    }

    res.json({
      user_id: user.id,
      is_admin: checkIsAdmin(user),
      is_patron: checkIsPatron(user),
    }).end()
  }))
  app.post('/api/grant', [checkToken, validate({body: createGrant})], asyncHandler(async (req, res) => {
    let payload: jwt.JwtPayload
    try {
      payload = services.jwt.decodeToken((req as unknown as IToken).token)
    } catch (e) {
      console.error(e)
      res.sendStatus(400).end()
      return
    }

    const user = await getAuthUser(services, payload)
    if (!checkIsAdmin(user)) {
      res.status(403).end()
      return
    }

    const {
      is_admin,
      override_patron_status,
    }: {
      is_admin?: boolean
      override_patron_status?: boolean
    } = req.body

    const grantId = services.grant.createGrant(is_admin ?? null, override_patron_status ?? null)
    const grant = services.grant.getGrantById(grantId)
    if (grant === null) {
      res.status(500).end()
      return
    }

    res.json({
      id: grant.id,
      expires: grant.expires,
      is_admin: grant.isAdmin,
      override_patron_status: grant.overridePatronStatus,
    }).end()
  }))
  app.get('/api/grant/:grantId', checkToken, asyncHandler(async (req, res) => {
    let payload: jwt.JwtPayload
    try {
      payload = services.jwt.decodeToken((req as unknown as IToken).token)
    } catch (e) {
      console.error(e)
      res.sendStatus(400).end()
      return
    }

    const user = await getAuthUser(services, payload)
    if (user === null) {
      res.status(403).end()
      return
    }

    const grantId = req.params.grantId
    const grant = services.grant.getGrantById(grantId)
    if (grant === null) {
      res.status(404).end()
      return
    }

    res.json({
      id: grant.id,
      expires: grant.expires,
      is_admin: grant.isAdmin,
      override_patron_status: grant.overridePatronStatus,
    }).end()
  }))
  app.get('/api/grant/:grantId/accept', checkToken, asyncHandler(async (req, res) => {
    let payload: jwt.JwtPayload
    try {
      payload = services.jwt.decodeToken((req as unknown as IToken).token)
    } catch (e) {
      console.error(e)
      res.sendStatus(400).end()
      return
    }

    let user = await getAuthUser(services, payload)
    if (user === null) {
      res.status(403).end()
      return
    }

    const grantId = req.params.grantId
    const grant = services.grant.getGrantById(grantId)
    if (grant === null || grant.expires < DateTime.utc()) {
      res.status(403).end()
      return
    }

    services.grant.deleteGrantById(grantId)
    if (user.user === null) {
      const { accessToken } = await getAccessToken(services, user)
      const { patreonUserId, name, isPatron } = await services.patreon.getPatronInfo(accessToken)

      if (user.userId === null) {
        // this really shouldn't happen but just in case
        services.token.updateToken(
          user.id,
          user.token,
          patreonUserId,
          isPatron,
        )
      }

      services.user.createUser(
        patreonUserId,
        name,
        grant.isAdmin ?? false,
        grant.overridePatronStatus ?? false,
      )
    } else {
      services.user.updateUser(
        user.user.id,
        user.user.name,
        grant.isAdmin ?? user.user.isAdmin,
        grant.overridePatronStatus ?? user.user.overridePatronStatus,
      )
    }

    user = await getAuthUser(services, payload)
    if (user === null) {
      res.status(500).end()
      return
    }

    res.json({
      user_id: user.id,
      is_admin: checkIsAdmin(user),
      is_patron: checkIsPatron(user),
    }).end()
  }))
  app.get('/api/campaign', (_req, res) => {
    return res.json(services.campaign.listCampaign()).end()
  })
  app.get('/api/campaign/:campaignId', (req, res) => {
    const campaignId = req.params.campaignId.replaceAll('-', '.')
    const campaign = services.campaign.getCampaignById(campaignId)
    if (campaign === null) return res.sendStatus(404).end()

    return res.json(campaign).end()
  })
  app.get('/api/campaign/:campaignId/scenario', (req, res) => {
    const campaignId = req.params.campaignId.replaceAll('-', '.')
    const campaign = services.campaign.getCampaignById(campaignId)
    if (campaign === null) return res.sendStatus(404).end()

    return res.json(
      services.scenario.listScenarioByCampaignId(campaignId)
    ).end()
  })
  app.get('/api/campaign/:campaignId/scene', (req, res) => {
    const campaignId = req.params.campaignId.replaceAll('-', '.')
    const campaign = services.campaign.getCampaignById(campaignId)
    if (campaign === null) return res.sendStatus(404).end()

    return res.json(services.scene.listSceneByCampaignId(campaignId)).end()
  })
  app.get('/api/scenario', (_req, res) => {
    return res.json(services.scenario.listScenario()).end()
  })
  app.get('/api/scenario/:scenarioId', (req, res) => {
    const scenarioId = req.params.scenarioId.replaceAll('-', '.')
    const scenario = services.scenario.getScenarioById(scenarioId)
    if (scenario === null) return res.sendStatus(404).end()

    return res.json(scenario).end()
  })
  app.get('/api/scenario/:scenarioId/scene', (req, res) => {
    const scenarioId = req.params.scenarioId.replaceAll('-', '.')
    const scenario = services.scenario.getScenarioById(scenarioId)
    if (scenario === null) return res.sendStatus(404).end()

    return res.json(services.scene.listSceneByScenarioId(scenarioId)).end()
  })
  app.get('/api/scene', (_req, res) => {
    return res.json(services.scene.listScene()).end()
  })
  app.get('/api/scene/:sceneId', asyncHandler(async (req, res) => {
    const sceneId = req.params.sceneId.replaceAll('-', '.')
    const scene = services.scene.getSceneById(sceneId)
    if (scene === null) {
      res.sendStatus(404).end()
      return
    }

    res.json(scene).end()
  }))
  app.get(
    '/api/scene/:sceneId/listen',
    checkToken,
    asyncHandler(async (req, res) => {
      let payload: jwt.JwtPayload
      try {
        payload = services.jwt.decodeToken((req as unknown as IToken).token)
      } catch (e) {
        console.error(e)
        res.sendStatus(400).end()
        return
      }

      const user = await getAuthUser(services, payload)
      if (user === null || !checkIsPatron(user)) {
        res.sendStatus(403).end()
        return
      }

      const sceneId = req.params.sceneId.replaceAll('-', '.')
      const scene = services.scene.getSceneById(sceneId)
      if (scene === null) {
        res.sendStatus(404).end()
        return
      }

      const filepath = services.scene.getSceneFilepath(scene)
      res
        .set('content-type', `audio/${scene.ext}`)
        .set('accept-ranges', 'bytes')
        .sendFile(filepath)
    }
    ))

  function checkToken(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers
    let token: string
    if (authorization !== undefined) {
      token = authorization.split(' ')[1]
    } else {
      token = req.cookies.token
    }

    if (token) {
      (req as unknown as IToken).token = token
      next()
    } else {
      // If header is undefined return Forbidden (403)
      res.sendStatus(403).end()
    }
  }
}

const getAuthUser = async (services: Services, payload: jwt.JwtPayload): Promise<Token | null> => {
  const user = services.token.getTokenById(payload.user_id)
  if (user === null) return null

  const { accessToken, refreshed } = await getAccessToken(services, user)
  if (
    !refreshed &&
    user.isPatron &&
    user.lastChecked.plus({ days: 1 }) >= DateTime.utc() &&
    user.userId !== null
  ) return user

  const { patreonUserId, isPatron } = await services.patreon.getPatronInfo(accessToken)
  services.token.updateToken(user.id, accessToken.token, patreonUserId, isPatron)
  return services.token.getTokenById(user.id)
}

const getAccessToken = async(services: Services, user: Token) => {
  const accessToken = services.patreon.client.createToken(user.token)
  if (!accessToken.expired()) {
    return {
      accessToken,
      refreshed: false,
    }
  }

  return {
    accessToken: await accessToken.refresh(),
    refreshed: true,
  }
}
