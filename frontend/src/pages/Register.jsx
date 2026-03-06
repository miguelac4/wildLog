/**
 * Register.jsx — Página de Registo (Split-Panel Layout)
 *
 * Layout dividido em dois painéis:
 *   - Esquerda: Formulário de criação de conta
 *   - Direita: Painel decorativo com branding WildLog
 *
 * Hooks usados:
 *   - useState()    → Gere o estado do formulário e dos erros
 *   - useNavigate() → Navega para outras rotas
 *
 * Conceitos React demonstrados:
 *   - Estado como objeto (formData com múltiplos campos)
 *   - Computed property names ([name]: value) para handler genérico
 *   - Validação client-side antes do submit
 *   - Conditional rendering ({errors.field && <span>...})
 *
 * Ficheiros relacionados:
 *   - styles/Auth.css       → Estilos do layout split-panel
 *   - config/mediaConfig.js → URLs dos assets (logo)
 *
 * TODO: Integrar com API backend (POST /api/auth/register)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MEDIA_URLS } from '../config/mediaConfig'
import SpotlightCard from '../components/SpotlightCard'
import { Waypoints, Binoculars, ExternalLink} from 'lucide-react'
import '../styles/Auth.css'

function Register() {
  /**
   * Form state — all fields in a single object.
   * This is better than having one useState per field when there are many fields.
   */
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Validation errors object (key = field name, value = message)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  /**
   * Generic change handler for all inputs.
   * Uses the input "name" attribute as the state key.
   * Example: <input name="email" /> → setFormData({ ...prev, email: value })
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  /**
   * Submit handler with validation.
   * Checks required fields and password match.
   */
  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.username) newErrors.username = 'Username is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    console.log('Register:', formData)
    // TODO: Call register API
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
            <h1>Create Account</h1>
            <p>Join the community! Fill in your details to get started.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {errors.username && <span className="error">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn btn-submit">
              Sign Up
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <span onClick={() => navigate('/login')} className="link">Log In</span>
            </p>
            <p onClick={() => navigate('/')} className="link back-home">← Back to Home</p>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL: Branding decorativo ===== */}
      <div className="auth-right">
        <div className="auth-right-content">
          <img src={MEDIA_URLS.logo} alt="WildLog" className="auth-right-logo" />
          <h2>Join WildLog</h2>
          <p>Create your account and start discovering and sharing natural places with a community that respects the wild.</p>

          {/* SpotlightCard decorativo com features */}
          <SpotlightCard className="auth-right-card" spotlightColor="rgba(139, 115, 85, 0.25)">
            <div className="card-stat">
              <div className="stat-icon"> <ExternalLink color="#9b805d" strokeWidth={1.75} /> </div>
              <div className="stat-info">
                <span className="stat-number">Share</span>
                <span className="stat-label">Post your favourite natural spots with photos and useful tips.</span>
              </div>
            </div>
            <div className="card-stat">
              <div className="stat-icon"> <Binoculars color="#9B805D" strokeWidth={1.75} /> </div>
              <div className="stat-info">
                <span className="stat-number">Discover</span>
                <span className="stat-label">Find hidden places and campsites shared by the community.</span>
              </div>
            </div>
            <div className="card-stat">
              <div className="stat-icon"> <Waypoints color="#9b805d" strokeWidth={1.5} /> </div>
              <div className="stat-info">
                <span className="stat-number">Connect</span>
                <span className="stat-label">Join a community of campers and nature lovers who explore responsibly.</span>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  )
}

export default Register