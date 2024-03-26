import express from 'express'
import ViteExpress from 'vite-express'
import config from './config'
import loader from './loader'

async function startServer() {
  const app = express()

  await loader({ app })

  ViteExpress.config({
    inlineViteConfig: {
      build: {
        outDir: './dist/client'
      }
    },
  })
  ViteExpress.listen(app, config.server.port, () => {
    console.log(`Your server is ready !`)
  })
}

startServer()
