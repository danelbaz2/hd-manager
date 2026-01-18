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
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@components': path.resolve(__dirname, './src/components'),
        '@features': path.resolve(__dirname, './src/features'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@contexts': path.resolve(__dirname, './src/contexts'),
        '@api': path.resolve(__dirname, './src/api'),
        '@schemas': path.resolve(__dirname, './src/schemas'),
        '@assets': path.resolve(__dirname, './src/assets'),
      },
    },
    define: {
      // Make root .env variables available
      'import.meta.env.VITE_SYSTEM_NAME': JSON.stringify(env.VITE_SYSTEM_NAME || 'Flow Task'),
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
