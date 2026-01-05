import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env from root directory (parent of frontend) AND current directory
  const env = { 
    ...loadEnv(mode, path.resolve(__dirname, '..'), 'VITE_'),
    ...loadEnv(mode, process.cwd(), '') 
  }
  
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'html-env-transform',
        transformIndexHtml(html) {
          return html.replace(
            /%(\w+)%/g,
            (match, key) => env[key] || match
          )
        }
      }
    ],
    define: {
      // Make root .env variables available
      'import.meta.env.VITE_SYSTEM_NAME': JSON.stringify(env.VITE_SYSTEM_NAME || 'Flow Task'),
    },
  }
})
