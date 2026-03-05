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
        {/* Logo and title section */}
        <div className="logo-section">
          <img src={MEDIA_URLS.logo} alt="WildLog Logo" className="logo-image" />
          <h1 className="logo-text">WildLog</h1>
          <p className="tagline">Connect with Nature</p>
        </div>

        {/* Platform description */}
        <div className="description">
          <p>Welcome to WildLog, the social network for nature and wildlife lovers!</p>
          <p>Share experiences, discover new places, and connect with enthusiasts around the world.</p>
        </div>

        {/* Action buttons — use navigate() for SPA navigation */}
        <div className="button-group">
          <button
              className="btn btn-login"
              onClick={() => navigate('/login')}
          >
            Log In
          </button>
          <button
              className="btn btn-register"
              onClick={() => navigate('/register')}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
