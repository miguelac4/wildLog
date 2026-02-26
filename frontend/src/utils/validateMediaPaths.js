import { MEDIA_URLS } from '../config/mediaConfig'

/**
 * Teste para verificar se os caminhos de mídia estão corretos
 * Execute este arquivo durante o desenvolvimento para validar URLs
 */

export function validateMediaPaths() {
  const errors = []

  console.log('=== Validação de Caminhos de Mídia ===\n')

  // Verificar se MEDIA_URLS está definido
  if (!MEDIA_URLS) {
    console.error('❌ MEDIA_URLS não está definido')
    return false
  }

  // Verificar cada URL
  Object.entries(MEDIA_URLS).forEach(([key, url]) => {
    console.log(`✓ ${key}: ${url}`)

    // Validações básicas
    if (!url.startsWith('/wildlog/')) {
      errors.push(`❌ ${key} não começa com /wildlog/`)
    }

    if (url.endsWith('/')) {
      errors.push(`❌ ${key} termina com /`)
    }
  })

  console.log('\n')

  if (errors.length > 0) {
    console.error('❌ Erros encontrados:')
    errors.forEach(error => console.error(error))
    return false
  } else {
    console.log('✅ Todos os caminhos de mídia estão corretos!')
    return true
  }
}

// Para usar em desenvolvimento, adicione ao seu main.jsx ou App.jsx:
// if (import.meta.env.DEV) {
//   validateMediaPaths()
// }

