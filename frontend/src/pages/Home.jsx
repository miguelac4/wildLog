/**
 * Home.jsx — Página inicial (Landing Page)
 *
 * Esta é a primeira página que o utilizador vê ao aceder à app.
 * Contém:
 *   - Vídeo de fundo fullscreen (background-video)
 *   - Logo da WildLog
 *   - Título e slogan
 *   - Descrição da plataforma
 *   - Botões de navegação para Login e Registo
 *
 * Hooks usados:
 *   - useNavigate() → função do React Router para navegar programaticamente
 *
 * Ficheiros relacionados:
 *   - styles/Home.css      → Estilos visuais desta página
 *   - config/mediaConfig.js → URLs dos assets (vídeo, logo)
 */
import { useNavigate } from 'react-router-dom'
import { MEDIA_URLS } from '../config/mediaConfig'
import '../styles/Home.css'

function Home() {
  // Hook de navegação — permite navegar para outras rotas sem <Link>
  const navigate = useNavigate()

  return (
    <div className="home-container">
      {/* Vídeo de fundo: autoPlay, muted (obrigatório para autoplay), loop */}
      <video className="background-video" autoPlay muted loop>
        <source src={MEDIA_URLS.banner} type="video/mp4" />
      </video>

      {/* Conteúdo sobreposto ao vídeo (z-index superior) */}
      <div className="content">
        {/* Secção do logo e título */}
        <div className="logo-section">
          <img src={MEDIA_URLS.logo} alt="WildLog Logo" className="logo-image" />
          <h1 className="logo-text">WildLog</h1>
          <p className="tagline">Conecte-se à Natureza</p>
        </div>

        {/* Descrição da plataforma */}
        <div className="description">
          <p>Bem-vindo à WildLog, a rede social para amantes da natureza e vida selvagem!</p>
          <p>Partilhe experiências, descubra novos lugares e conecte-se com entusiastas ao redor do mundo.</p>
        </div>

        {/* Botões de ação — usam navigate() para SPA navigation */}
        <div className="button-group">
          <button
            className="btn btn-login"
            onClick={() => navigate('/login')}
          >
            Entrar
          </button>
          <button
            className="btn btn-register"
            onClick={() => navigate('/register')}
          >
            Registar
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
