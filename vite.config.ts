import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Encaminha "/api/*" para o backend .NET local (dotnet run na porta 5066).
      // Em produção a mesma origem deve servir /api ou VITE_API_URL aponta direto.
      '/api': 'http://localhost:5066',
    },
  },
})
