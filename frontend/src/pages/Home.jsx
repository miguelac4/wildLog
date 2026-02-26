import { useNavigate } from 'react-router-dom'
import { MEDIA_URLS } from '../config/mediaConfig'
import '../styles/Home.css'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-container">
      <video className="background-video" autoPlay muted loop>
        <source src={MEDIA_URLS.banner} type="video/mp4" />
      </video>
      <div className="content">
        <div className="logo-section">
          <img src={MEDIA_URLS.logo} alt="WildLog Logo" className="logo-image" />
          <h1 className="logo-text">WildLog</h1>
          <p className="tagline">Conecte-se à Natureza</p>
        </div>

        <div className="description">
          <p>Bem-vindo à WildLog, a rede social para amantes da natureza e vida selvagem!</p>
          <p>Partilhe experiências, descubra novos lugares e conecte-se com entusiastas ao redor do mundo.</p>
        </div>

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
