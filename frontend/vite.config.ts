import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env from root directory (parent of frontend)
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '..'), 'VITE_')
  
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Make root .env variables available
      'import.meta.env.VITE_SYSTEM_NAME': JSON.stringify(rootEnv.VITE_SYSTEM_NAME || 'Flow Task'),
    },
  }
})
