import * as dotenv from "dotenv";
import { from } from "env-var";
import path from "path";
import fs from "fs";
import { validate } from 'uuid';

if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: `${process.env.HOME}/dissonant_voices.env` });
} else {
  dotenv.config({ path: "./.env" });
}

const env = from(process.env, {
  asPath: (
    value,
    {
      isAbsolute = false,
      isDirectory = false,
      isFile = false,
      exists = false,
    }: {
      isAbsolute?: boolean;
      exists?: boolean;
      isDirectory?: boolean;
      isFile?: boolean;
    } = {}
  ) => {
    const pathString = path.format(path.parse(value));
    if (isAbsolute && !path.isAbsolute(pathString)) {
      throw new Error(`${pathString} is not absolute`);
    } else if (exists && !fs.existsSync(pathString)) {
      throw new Error(`${pathString} doesn't exist`);
    } else if (isDirectory && !fs.lstatSync(pathString).isDirectory()) {
      throw new Error(`${pathString} isn't a directory`);
    } else if (isFile && !fs.lstatSync(pathString).isFile()) {
      throw new Error(`${pathString} isn't a file`);
    }
    return pathString;
  },
  asUUID: (value) => {
    if (!validate(value)) {
      throw Error(value);
    }

    return value;
  },
});

const config = {
  env: env.get("NODE_ENV").required().asEnum(["production", "staging"]),
  adminId: env.get("ADMIN_ID").required().asUUID(),
  db: {
    path: env.get("DB_PATH").asPath({ isAbsolute: true, isFile: true, }),
  },
  server: {
    port: env.get("PORT").required().asPortNumber(),
  },
  patreon: {
    clientId: env.get("PATREON_CLIENT_ID").required().asString(),
    clientSecret: env.get("PATREON_CLIENT_SECRET").required().asString(),
    host: env
      .get("PATREON_HOST")
      .default("https://www.patreon.com")
      .asUrlObject().origin,
    tokenPath: env
      .get("PATREON_TOKEN_PATH")
      .default("/api/oauth2/token")
      .asString(),
    authorizePath: env
      .get("PATREON_AUTHORIZE_PATH")
      .default("/oauth2/authorize")
      .asString(),
    redirectUrl: env.get("PATREON_REDIRECT_URL").required().asString(),
    campaignId: env.get("PATREON_CAMPAIGN_ID").required().asString(),
  },
  jwt: {
    secret: env.get("JWT_SECRET").required().asString(),
    algorithm: env
      .get("JWT_ALGORITHM")
      .asEnum(["HS512", "HS256", "HS384", "RS256"]),
  },
  assets: {
    sceneAudioPath: env
      .get("SCENE_AUDIO_PATH")
      .required()
      .asPath({ isAbsolute: true, isDirectory: true, exists: true }),
    verifySceneAudioExists: env
      .get("VERIFY_AUDIO_ASSETS_EXIST")
      .default("false")
      .asBool(),
  },
};

export default config;
