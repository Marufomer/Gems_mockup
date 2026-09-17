import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { localNetlifyFunctionsPlugin } from './src/utils/localNetlifyDevPlugin.js'

export default defineConfig({
  plugins: [react(), tailwindcss(), localNetlifyFunctionsPlugin()],
})

