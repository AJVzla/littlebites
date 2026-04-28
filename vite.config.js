import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/littlebites/', // Esto es clave para que encuentre los assets
  plugins: [react()],
})