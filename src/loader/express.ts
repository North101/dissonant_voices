import express, { NextFunction, Response } from "express";
import cors from "cors";
import asyncHandler from 'express-async-handler';
import { DateTime } from "luxon";
import path from 'path';
import { AccessToken } from "simple-oauth2";
import url from 'url';
import config from "../config";
import { Services } from "./services";
import cookieParser from 'cookie-parser';

export default async ({
  app,
  services,
}: {
  app: express.Application;
  services: Services;
}) => {
  app.use(cors());
  app.use(cookieParser());
  app.use(express.json());

  app.get("/authorize", (req, res) => {
    const { state, type } = req.query;
    return res.redirect(services.patreon.getPatreonRedirectUrl(state as string, type as string));
  });
  app.get("/redirect", asyncHandler(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.query.type === 'web') {
      return res.status(200).json({
        message: "success",
      }).end();
    }
    return res.redirect(url.format({
      protocol: 'dissonantvoices',
      slashes: true,
      pathname: 'auth/redirect',
      query: parsedUrl.query,
    }));
  }));
  app.post("/token", asyncHandler(async (req, res) => {
    const { type } = req.query;
    const { code } = req.body;
    let accessToken: AccessToken;
    try {
      accessToken = await services.patreon.getAccessToken(code as string, type as string);
    } catch (e) {
      console.error(e);
      return res.status(401).json({
        message: 'Invalid code',
      }).end();
    }
    const isPatron = await services.patreon.getPatronStatus(accessToken);
    const userId = services.user.createUser(accessToken.token, isPatron);

    return res.send(services.jwt.encodeAuthToken(userId)).end();
  }));
  app.get("/api/campaign", (_req, res) => {
    return res.json(services.campaign.listCampaign()).end();
  });
  app.get("/api/campaign/:campaignId", (req, res) => {
    const campaignId = req.params.campaignId;
    const campaign = services.campaign.getCampaignById(campaignId);
    if (campaign === null) return res.sendStatus(404).end();

    return res.json(campaign).end();
  });
  app.get("/api/campaign/:campaignId/scenario", (req, res) => {
    const campaignId = req.params.campaignId;
    const campaign = services.campaign.getCampaignById(campaignId);
    if (campaign === null) return res.sendStatus(404).end();

    return res.json(
      services.scenario.listScenarioByCampaignId(campaignId)
    ).end();
  });
  app.get("/api/campaign/:campaignId/scene", (req, res) => {
    const campaignId = req.params.campaignId;
    const campaign = services.campaign.getCampaignById(campaignId);
    if (campaign === null) return res.sendStatus(404).end();

    return res.json(services.scene.listSceneByCampaignId(campaignId)).end();
  });
  app.get("/api/scenario", (_req, res) => {
    return res.json(services.scenario.listScenario()).end();
  });
  app.get("/api/scenario/:scenarioId", (req, res) => {
    const scenarioId = req.params.scenarioId;
    const scenario = services.scenario.getScenarioById(scenarioId);
    if (scenario === null) return res.sendStatus(404).end();

    return res.json(scenario).end();
  });
  app.get("/api/scenario/:scenarioId/scene", (req, res) => {
    const scenarioId = req.params.scenarioId;
    const scenario = services.scenario.getScenarioById(scenarioId);
    if (scenario === null) return res.sendStatus(404).end();

    return res.json(services.scene.listSceneByScenarioId(scenarioId)).end();
  });
  app.get("/api/scene", (_req, res) => {
    return res.json(services.scene.listScene()).end();
  });
  app.get("/api/scene/:sceneId", asyncHandler(async (req: any, res) => {
    const sceneId = req.params.sceneId;
    const scene = services.scene.getSceneById(sceneId);
    if (scene === null) return res.sendStatus(404).end();

    return res.json(scene).end();
  }));
  app.get(
    "/api/scene/:sceneId/listen",
    checkAuthToken,
    asyncHandler(async (req: any, res) => {
      let payload;
      try {
        payload = services.jwt.decodeToken(req.token);
      } catch (e) {
        console.error(e);
        return res.sendStatus(400).end();
      }

      if (payload.admin_id !== config.adminId) {
        const user = services.user.getUserById(payload.user_id);
        if (user === null) return res.sendStatus(403).end();

        let accessToken = services.patreon.client.createToken(user.token);
        if (
          accessToken.expired() ||
          !user.isPatron ||
          user.lastChecked.plus({ days: 1 }) < DateTime.utc()
        ) {
          if (accessToken.expired()) {
            accessToken = await accessToken.refresh();
          }
          const isPatron = await services.patreon.getPatronStatus(accessToken);
          services.user.updateUser(user.id, accessToken.token, isPatron);

          if (!isPatron) return res.sendStatus(403).end();
        }
      }

      const sceneId = req.params.sceneId;
      const scene = services.scene.getSceneById(sceneId);
      if (scene === null) return res.sendStatus(404).end();

      const filepath = services.scene.getSceneFilepath(scene);
      return res
        .set("content-type", `audio/${scene.ext}`)
        .set("accept-ranges", "bytes")
        .sendFile(filepath);
    }
  ));

  function checkAuthToken(req: any, res: Response, next: NextFunction) {
    const { authorization } = req.headers;
    let token: string;
    if (authorization !== undefined) {
      token = authorization.split(" ")[1];
    } else {
      token = req.cookies.token;
    }
  
    if (token) {
      req.token = token;
      next();
    } else {
      // If header is undefined return Forbidden (403)
      res.sendStatus(403).end();
    }
  }

  app.use(express.static(path.join(process.cwd(), '/public/')));
  app.get('*', (req,res) =>{
      res.sendFile(path.join(process.cwd(), '/public/index.html'));
  });
};
