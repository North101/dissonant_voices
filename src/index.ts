import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import fs from 'fs';
import path from 'path';
import express from "express";
import { NextFunction, Request, Response } from "express-serve-static-core";
import { AddressInfo } from "net";
import { getAccessToken, getPatronStatus, PATREON_AUTHORIZE_URL } from "./patreon";
import { createUser, getSceneById, getUserById, updateUser } from "./db";
import { decodeAuthToken, encodeAuthToken } from "./jwt";

export function PatreonAuthorize(_req: Request, res: Response) {
  res.redirect(PATREON_AUTHORIZE_URL);
}

export async function PatreonRedirect(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { code } = req.query;

  // Save the access token
  try {
    const { accessToken, isPatron } = await getPatronStatus(await getAccessToken(code as string));

    const userId = createUser(accessToken, isPatron);
    const token = encodeAuthToken(userId, new Date(accessToken.token.expires_at).getDate());
    res.set('content-type', 'application/json');
    res.send(
      JSON.stringify(
        {
          token,
          is_patron: isPatron,
        },
        null,
        4
      )
    );
  } catch (error) {
    console.log("Access Token Error", error.message);
    next(
      JSON.stringify({
        error: "Unknown",
      })
    );
  }
}

const PORT = process.env.PORT;
const app = express();
const server = app.listen(PORT, async () => {
  const port: AddressInfo = server.address() as AddressInfo;
  console.log(`Listening on http://localhost:${port.port}`);
});
app.get("/oauth/authorize", PatreonAuthorize);
app.get(process.env.REDIRECT_PATHNAME, PatreonRedirect);
app.get("/scene/:sceneId", checkAuthToken, async (req: any, res) => {
  const payload = decodeAuthToken(req.token);
  const user = getUserById(payload.user_id);
  if (!user) return res.sendStatus(403);

  if (!user.isPatron || user.lastChecked.getDate() < Date.now()) {
    const { isPatron } = await getPatronStatus(user.accessToken);
    updateUser(user.id, isPatron);

    if (!isPatron) return res.sendStatus(403);
  }

  const sceneId = req.params.sceneId;
  const scene = getSceneById(sceneId);
  if (!scene) return res.sendStatus(404);

  const filename = path.join(process.env.SCENE_DIR, scene.filename);
  if (!path.isAbsolute(filename) || !fs.existsSync(filename)) {
    return res.sendStatus(500);
  }

  res.set('content-type', 'audio/mp3');
  res.set('accept-ranges', 'bytes');
  res.sendFile(filename);
});

function checkAuthToken(req: any, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (typeof header !== "undefined") {
    const bearer = header.split(" ");
    const token = bearer[1];

    req.token = token;
    next();
  } else {
    // If header is undefined return Forbidden (403)
    res.sendStatus(403);
  }
}
