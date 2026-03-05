/**
 * Register.jsx — Página de Registo
 *
 * Formulário de criação de conta com validação client-side.
 * Campos: username, email, password, confirmPassword.
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
 *   - styles/Auth.css → Estilos partilhados entre Login e Register
 *
 * TODO: Integrar com API backend (POST /api/auth/register)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

    // If there are errors, show them and do not submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    console.log('Register:', formData)
    // TODO: Call register API
  }

  return (
      <div className="auth-container">
        <div className="auth-content">
          <div className="auth-header">
            <h1>🐾 WildLog</h1>
            <p className="auth-title">Create Account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Field: Username */}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="your_username"
                  value={formData.username}
                  onChange={handleChange}
                  required
              />
              {errors.username && <span className="error">{errors.username}</span>}
            </div>

            {/* Field: Email */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            {/* Field: Password */}
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

            {/* Field: Confirm Password */}
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

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <span onClick={() => navigate('/login')} className="link">
              Log In
            </span>
            </p>
            <p onClick={() => navigate('/')} className="link back-home">← Back</p>
          </div>
        </div>
      </div>
  )
}

export default Register

