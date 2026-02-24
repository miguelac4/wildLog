import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Auth.css'

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.username) newErrors.username = 'Utilizador é obrigatório'
    if (!formData.email) newErrors.email = 'Email é obrigatório'
    if (!formData.password) newErrors.password = 'Palavra-passe é obrigatória'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As palavras-passe não coincidem'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    console.log('Register:', formData)
    // Aqui você adicionará a lógica de registo
  }

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-header">
          <h1>🐾 WildLog</h1>
          <p className="auth-title">Criar Conta</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Utilizador</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="seu_utilizador"
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
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Palavra-passe</label>
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
            <label htmlFor="confirmPassword">Confirmar Palavra-passe</label>
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
            Registar
          </button>
        </form>

        <div className="auth-footer">
          <p>Já tem conta? <span onClick={() => navigate('/login')} className="link">Entrar</span></p>
          <p onClick={() => navigate('/')} className="link back-home">← Voltar</p>
        </div>
      </div>
    </div>
  )
}

export default Register

