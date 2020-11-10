import express, { NextFunction, Response } from "express";
import { DateTime } from "luxon";
import config from "../config";

import { Services } from "./services";

export default async ({
  app,
  services,
}: {
  app: express.Application;
  services: Services;
}) => {
  app.use(express.json());
  app.get("/authorize", (req, res) => {
    const { state } = req.query;
    res.redirect(services.patreon.getPatreonRedirectUrl(state as string));
  });
  app.get("/redirect", async (_req, res) => {
    return res.sendStatus(200).end();
  });
  app.post("/token", async (req, res) => {
    const code = req.body.code;
    const accessToken = await services.patreon.getAccessToken(code as string);
    const isPatron = await services.patreon.getPatronStatus(accessToken);
    const userId = services.user.createUser(accessToken.token, isPatron);

    return res.send(services.jwt.encodeAuthToken(userId)).end();
  });
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
    return res.json(services.scenario.listScenario());
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
  app.get("/api/scene/:sceneId", checkAuthToken, async (req: any, res) => {
    const sceneId = req.params.sceneId;
    const scene = services.scene.getSceneById(sceneId);
    if (scene === null) return res.sendStatus(404).end();

    return res.json(scene).end();
  });
  app.get(
    "/api/scene/:sceneId/listen",
    checkAuthToken,
    async (req: any, res) => {
      let payload;
      try {
        payload = services.jwt.decodeToken(req.token);
      } catch (e) {
        console.log(e);
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
      res.set("content-type", `audio/${scene.ext}`);
      res.set("accept-ranges", "bytes");
      res.sendFile(filepath);
    }
  );

  function checkAuthToken(req: any, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (typeof header !== "undefined") {
      const bearer = header.split(" ");
      const token = bearer[1];

      req.token = token;
      next();
    } else {
      // If header is undefined return Forbidden (403)
      res.sendStatus(403).end();
    }
  }
};
