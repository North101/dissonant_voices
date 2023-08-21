import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import react from '@vitejs/plugin-react'
import rollup from 'rollup'
import { PluginOption, defineConfig } from 'vite'

const viteExpressBuilder = (): PluginOption => {
  return {
    name: 'Vite Express Builder',
    async writeBundle() {
      const config = await rollup.rollup({
        input: './src/server/main.ts',
        external: ['express', 'vite-express'],
        plugins: [
          typescript({
            module: 'ESNext',
            exclude: './src/client/**',
          }),
          json(),
        ],
      })
      await config.write({
        dir: './dist/server',
        format: 'cjs',
      })
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
    viteExpressBuilder(),
  ],
})
