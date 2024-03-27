import 'dotenv/config'
import envVar from 'env-var'
import fs from 'fs'
import path from 'path'

const env = envVar.from(process.env, {
  asPath: (
    value,
    {
      isAbsolute = false,
      isDirectory = false,
      exists = false,
    }: {
      isAbsolute?: boolean
      exists?: boolean
      isDirectory?: boolean
    } = {}
  ) => {
    const pathString = path.format(path.parse(value))
    if (isAbsolute && !path.isAbsolute(pathString)) {
      throw new Error(`${pathString} is not absolute`)
    } else if (exists && !fs.existsSync(pathString)) {
      throw new Error(`${pathString} doesn't exist`)
    } else if (isDirectory && !fs.existsSync(pathString) && !fs.lstatSync(pathString).isDirectory()) {
      throw new Error(`${pathString} isn't a directory`)
    }
    return pathString
  },
})

const config = {
  env: env.get('NODE_ENV').required().asEnum(['production', 'development']),
  server: {
    port: env.get('PORT').required().asPortNumber(),
  },
  patreon: {
    clientId: env.get('PATREON_CLIENT_ID').required().asString(),
    clientSecret: env.get('PATREON_CLIENT_SECRET').required().asString(),
    host: env
      .get('PATREON_HOST')
      .default('https://www.patreon.com')
      .asUrlObject().origin,
    tokenPath: env
      .get('PATREON_TOKEN_PATH')
      .default('/api/oauth2/token')
      .asString(),
    authorizePath: env
      .get('PATREON_AUTHORIZE_PATH')
      .default('/oauth2/authorize')
      .asString(),
    redirectUrl: env.get('PATREON_REDIRECT_URL').required().asString(),
    campaignId: env.get('PATREON_CAMPAIGN_ID').required().asString(),
  },
  assets: {
    sceneAudioPath: env
      .get('SCENE_AUDIO_PATH')
      .required()
      .asPath({ isAbsolute: true, isDirectory: true, exists: true }),
    verifySceneAudioExists: env
      .get('VERIFY_AUDIO_ASSETS_EXIST')
      .default('false')
      .asBool(),
  },
}

export default config
