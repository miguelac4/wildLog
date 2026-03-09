/**
 * vite.config.js — Configuração do Vite (bundler/dev server)
 *
 * O Vite é a ferramenta que:
 *   1. Serve a app em desenvolvimento com Hot Module Replacement (HMR)
 *   2. Faz o build de produção (minifica, otimiza, gera assets)
 *
 * A função defineConfig recebe o "mode" que pode ser:
 *   - "development" (npm run dev)
 *   - "production"  (npm run build)
 *   - "production-root" (npm run build -- --mode production-root)
 *
 * A propriedade "base" define o caminho base da app:
 *   - "/wildlog/" → para rh360.pt/wildlog (subpasta)
 *   - "/"         → para wild-log.com (raiz do domínio)
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'

export default defineConfig(({ mode }) => {
  // Por defeito, a app vive em /wildlog/ (subpasta no rh360.pt)
  let base = '/wildlog/'

  // Se o mode for "production-root", a app vive na raiz (wild-log.com)
  if (mode === 'production-root') {
    base = '/'
  }

  return {
    base,
    plugins: [react(), cesium()],       // Plugin oficial do React (JSX transform, Fast Refresh)
    publicDir: 'public',      // Pasta com ficheiros estáticos copiados tal como estão para dist/
    server: {
      port: 3000,             // Porta do servidor de desenvolvimento
      open: true              // Abre o browser automaticamente ao fazer npm run dev
    },
    build: {
      outDir: 'dist',         // Pasta de output do build de produção
      sourcemap: false,       // Sem sourcemaps em produção (menor tamanho)
      copyPublicDir: true,    // Copia a pasta public/ para dist/
    }
  }
})
