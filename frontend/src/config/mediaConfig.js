/**
 * mediaConfig.js — Configuração centralizada de URLs de mídia/assets
 *
 * Problema que resolve:
 *   A app pode correr em dois domínios diferentes:
 *     - rh360.pt/wildlog  → assets ficam em /wildlog/media/...
 *     - wild-log.com      → assets ficam em /media/...
 *
 *   Este ficheiro detecta o domínio e gera os caminhos corretos.
 *
 * Como usar:
 *   import { MEDIA_URLS } from '../config/mediaConfig'
 *   <img src={MEDIA_URLS.logo} />
 *   <video><source src={MEDIA_URLS.banner} /></video>
 *
 * Para adicionar novas imagens/vídeos:
 *   1. Coloca o ficheiro em public/media/
 *   2. Adiciona a entrada ao objeto MEDIA_URLS abaixo
 */

/**
 * Detecta o basename baseado no hostname atual.
 * Usado para construir URLs absolutas corretas para os assets.
 */
const getBaseName = () => {
  // SSR safety: se window não existir, assume subpasta
  if (typeof window === 'undefined') return '/wildlog'

  const hostname = window.location.hostname

  // wild-log.com → raiz
  if (hostname.includes('wild-log.com')) {
    return ''
  }

  // rh360.pt ou localhost → subpasta
  return '/wildlog'
}

const BASENAME = getBaseName()

/**
 * Objeto com todos os URLs de mídia da aplicação.
 * Todos os ficheiros devem existir em public/media/
 */
export const MEDIA_URLS = {
  banner: `${BASENAME}/media/banner.mp4`,   // Vídeo de fundo da Home (fullscreen)
  logo: `${BASENAME}/media/logoWM.png`,     // Logo com marca de água (usado na Home)
}

