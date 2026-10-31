import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Всегда один и тот же адрес: http://localhost:5173 (он же указан в Supabase и GitHub).
  // Если порт занят старым запуском — Vite сообщит об ошибке, а не уйдёт на 5174, 5175...
  server: { port: 5173, strictPort: true },
})
