import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Determina a base URL dependendo do ambiente
  let base = '/wildlog/'

  if (mode === 'production-root') {
    base = '/' // Para wild-log.com na raiz
  }

  return {
    base: base,
    plugins: [react()],
    publicDir: 'public',
    server: {
      port: 3000,
      open: true
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      copyPublicDir: true
    }
  }
})
