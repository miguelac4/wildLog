/**
 * Login.jsx — Página de Login
 *
 * Formulário de autenticação com campos de email e password.
 * Atualmente faz apenas console.log (sem integração com backend).
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
 *   - styles/Auth.css → Estilos partilhados entre Login e Register
 *
 * TODO: Integrar com API backend (POST /api/auth/login)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <div className="auth-container">
      <div className="auth-content">
        {/* Cabeçalho com branding */}
        <div className="auth-header">
          <h1>🐾 WildLog</h1>
          <p className="auth-title">Entrar</p>
        </div>

        {/* Formulário — onSubmit chama handleSubmit */}
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

        {/* Footer com links de navegação */}
        <div className="auth-footer">
          <p>Não tem conta? <span onClick={() => navigate('/register')} className="link">Registar</span></p>
          <p onClick={() => navigate('/')} className="link back-home">← Voltar</p>
        </div>
      </div>
    </div>
  )
}

export default Login

