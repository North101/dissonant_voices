import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import { FilterPattern } from '@rollup/pluginutils'
import react from '@vitejs/plugin-react'
import rollup from 'rollup'
import { PluginOption, defineConfig } from 'vite'

interface ViteExpressBuilderProps {
  output?: rollup.OutputOptions
  exclude?: FilterPattern
  external?: rollup.ExternalOption[]
  plugins?: rollup.InputPluginOption[]
}

const viteExpressBuilder = ({
  output = {
    dir: './dist/server',
    format: 'cjs',
  },
  exclude = './src/client/**',
  external = [],
  plugins = [],
}: ViteExpressBuilderProps = {}): PluginOption => {
  return {
    name: 'Vite Express Builder',
    async writeBundle() {
      const config = await rollup.rollup({
        input: './src/server/main.ts',
        external: [
          ...external,
          'express',
          'vite-express',
        ],
        plugins: [
          ...plugins,
          typescript({
            module: 'ESNext',
            exclude: exclude,
          }),
        ],
      })
      await config.write(output)
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: './dist/client',
  },
  plugins: [
    react(),
    viteExpressBuilder({
      external: [
        '@blackglory/better-sqlite3-migrations',
        'better-sqlite3',
        'cookie-parser',
        'cors',
        'dotenv',
        'env-var',
        'express-async-handler',
        'express-json-validator-middleware',
        'fs',
        'jwt-simple',
        'luxon',
        'path',
        'patreon-ts',
        'patreon-ts/dist/types/token',
        'simple-oauth2',
        'url',
        'uuid',
      ],
      plugins: [
        json(),
      ],
    }),
  ],
})
