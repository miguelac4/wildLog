// Configuração de URLs para mídia e assets
// Garante que os caminhos funcionem corretamente em qualquer ambiente

// Detecta o basename baseado no hostname
const getBaseName = () => {
  if (typeof window === 'undefined') return '/wildlog';

  const hostname = window.location.hostname;

  // wild-log.com na raiz
  if (hostname.includes('wild-log.com') || hostname.includes('www.wild-log.com')) {
    return '';
  }

  // rh360.pt em subpasta
  return '/wildlog';
};

const BASENAME = getBaseName();

export const MEDIA_URLS = {
  banner: `${BASENAME}/media/banner.mp4`,
  logo: `${BASENAME}/media/logoWM.png`,
  logoText: `${BASENAME}/media/logoText.jpg`,
  logoTextWM: `${BASENAME}/media/logoTextWM.png`,
};

export default MEDIA_URLS;

