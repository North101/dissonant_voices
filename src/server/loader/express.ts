import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import url2 from 'url'

import { Services } from './services'
import { AccessToken } from 'simple-oauth2'

export interface TokenRequest extends Request {
  token: AccessToken
}

export default async ({
  app,
  services,
}: {
  app: express.Application
  services: Services
}) => {
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
  app.post('/api/token', asyncHandler(async (req, res) => {
    const { client_id, code }: { client_id: string, code: string } = req.body
    try {
      const accessToken = await services.patreon.getAccessToken(code, client_id)
      const { isPatron } = await services.patreon.getPatronInfo(accessToken)
      res.json({
        token: services.jwt.encodeToken(accessToken.token),
        is_patron: isPatron,
      }).end()
      return
    } catch (e) {
      console.error(e)
      res.status(401).json({
        message: 'Invalid code',
      }).end()
      return
    }
  }))
  app.get('/api/campaign', (_req, res) => {
    return res.json(services.campaign.listCampaign()).end()
  })
  app.get('/api/campaign/:campaignId', (req, res) => {
    const campaignId = req.params.campaignId
    const campaign = services.campaign.getCampaignById(campaignId)
    if (campaign === null) return res.sendStatus(404).end()

    return res.json(campaign).end()
  })
  app.get('/api/campaign/:campaignId/scenario', (req, res) => {
    const campaignId = req.params.campaignId
    const campaign = services.campaign.getCampaignById(campaignId)
    if (campaign === null) return res.sendStatus(404).end()

    return res.json(
      services.scenario.listScenarioByCampaignId(campaignId)
    ).end()
  })
  app.get('/api/campaign/:campaignId/scene', (req, res) => {
    const campaignId = req.params.campaignId
    const campaign = services.campaign.getCampaignById(campaignId)
    if (campaign === null) return res.sendStatus(404).end()

    return res.json(services.scene.listSceneByCampaignId(campaignId)).end()
  })
  app.get('/api/scenario', (_req, res) => {
    return res.json(services.scenario.listScenario()).end()
  })
  app.get('/api/scenario/:scenarioId', (req, res) => {
    const scenarioId = req.params.scenarioId
    const scenario = services.scenario.getScenarioById(scenarioId)
    if (scenario === null) return res.sendStatus(404).end()

    return res.json(scenario).end()
  })
  app.get('/api/scenario/:scenarioId/scene', (req, res) => {
    const scenarioId = req.params.scenarioId
    const scenario = services.scenario.getScenarioById(scenarioId)
    if (scenario === null) return res.sendStatus(404).end()

    return res.json(services.scene.listSceneByScenarioId(scenarioId)).end()
  })
  app.get('/api/scene', (_req, res) => {
    return res.json(services.scene.listScene()).end()
  })
  app.get('/api/scene/:sceneId', asyncHandler(async (req, res) => {
    const sceneId = req.params.sceneId
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
      try {
        const { isPatron } = await services.patreon.getPatronInfo(req.token)
        if (!isPatron) {
          res.sendStatus(403).end()
          return
        }
      } catch (e) {
        console.log(e)
        res.sendStatus(403).end()
        return
      }

      const sceneId = req.params.sceneId
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
    }),
  )

  async function checkToken(req: TokenRequest, res: Response, next: NextFunction) {
    const { authorization } = req.headers
    let token: string
    if (authorization !== undefined) {
      token = authorization.split(' ')[1]
    } else {
      token = req.cookies.token
    }

    if (!token) {
      res.sendStatus(403).end()
      return
    }

    try {
      const jwt = services.jwt.decodeToken(token)
      req.token = services.patreon.client.createToken(jwt.token)
      next()
    } catch (e) {
      console.error(e)
      // If header is undefined return Forbidden (403)
      res.sendStatus(403).end()
    }
  }
}
