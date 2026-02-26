import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Auth.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Login:', { email, password })
    // Aqui você adicionará a lógica de autenticação
  }

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-header">
          <h1>🐾 WildLog</h1>
          <p className="auth-title">Entrar</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Palavra-passe</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-submit">
            Entrar
          </button>
        </form>

        <div className="auth-footer">
          <p>Não tem conta? <span onClick={() => navigate('/register')} className="link">Registar</span></p>
          <p onClick={() => navigate('/')} className="link back-home">← Voltar</p>
        </div>
      </div>
    </div>
  )
}

export default Login

