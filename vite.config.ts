import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // 這裡做一個特殊的處理，讓原本代碼中的 process.env.API_KEY 能讀取到 Vercel 的環境變數
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})