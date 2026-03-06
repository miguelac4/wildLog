/**
 * Login.jsx — Página de Login (Split-Panel Layout)
 *
 * Layout dividido em dois painéis:
 *   - Esquerda: Formulário de autenticação (email + password)
 *   - Direita: Painel decorativo com branding WildLog
 *
 * Hooks usados:
 *   - useState()    → Gere o estado local dos inputs (email, password)
 *   - useNavigate() → Navega para outras rotas (register, home)
 *
 * Conceitos React demonstrados:
 *   - Controlled Components (inputs controlados pelo state)
 *   - Event Handling (onChange, onSubmit)
 *   - Formulários com preventDefault()
 *
 * Ficheiros relacionados:
 *   - styles/Auth.css       → Estilos do layout split-panel
 *   - config/mediaConfig.js → URLs dos assets (logo)
 *
 * TODO: Integrar com API backend (POST /api/auth/login)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MEDIA_URLS } from '../config/mediaConfig'
import '../styles/Auth.css'

function Login() {
  // Estado dos campos do formulário (controlled components)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  /**
   * Handler do submit do formulário.
   * preventDefault() evita o reload da página (comportamento default de forms HTML).
   */
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Login:', { email, password })
    // TODO: Chamar API de login e gerir autenticação
  }

  return (
    <div className="auth-page">
      {/* ===== LEFT PANEL: Formulário ===== */}
      <div className="auth-left">
        <div className="auth-left-inner">
          {/* Brand mark */}
          <div className="auth-brand">
            <span>WildLog</span>
          </div>

          {/* Header */}
          <div className="auth-header">
            <h1>Log In</h1>
            <p>Welcome back! Please enter your details.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Remember me + Forgot password */}
            <div className="form-extras">
              <label>
                <input type="checkbox" /> Remember for 30 days
              </label>
              <button type="button" className="forgot-link">Forgot password</button>
            </div>

            <button type="submit" className="btn btn-submit">
              Sign In
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <span onClick={() => navigate('/register')} className="link">Sign Up</span>
            </p>
            <p onClick={() => navigate('/')} className="link back-home">← Back to Home</p>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL: Branding decorativo ===== */}
      <div className="auth-right">
        <div className="auth-right-content">
          <img src={MEDIA_URLS.logo} alt="WildLog" className="auth-right-logo" />
          <h2>Welcome to WildLog</h2>
          <p>Connect with nature lovers around the world. Share your discoveries and respect the wild.</p>

          {/* Card decorativo com stats */}
          <div className="auth-right-card">
            <div className="card-stat">
              <div className="stat-icon">🌍</div>
              <div className="stat-info">
                <span className="stat-number">50+</span>
                <span className="stat-label">Countries connected</span>
              </div>
            </div>
            <div className="card-stat">
              <div className="stat-icon">📸</div>
              <div className="stat-info">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Wildlife sightings</span>
              </div>
            </div>
            <div className="card-stat">
              <div className="stat-icon">🦎</div>
              <div className="stat-info">
                <span className="stat-number">2K+</span>
                <span className="stat-label">Species catalogued</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login