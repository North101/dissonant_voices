import react from '@vitejs/plugin-react-swc'
import path from 'node:path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: './dist/client',
    target: 'esnext',
  },
  plugins: [
    react(),
  ],
})
