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
   * Estado do formulário — todos os campos num único objeto.
   * Isto é melhor que ter um useState por campo quando há muitos campos.
   */
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Objeto de erros de validação (chave = nome do campo, valor = mensagem)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  /**
   * Handler genérico de change para todos os inputs.
   * Usa o atributo "name" do input como chave do estado.
   * Exemplo: <input name="email" /> → setFormData({ ...prev, email: value })
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  /**
   * Handler de submit com validação.
   * Verifica campos obrigatórios e correspondência de passwords.
   */
  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.username) newErrors.username = 'Utilizador é obrigatório'
    if (!formData.email) newErrors.email = 'Email é obrigatório'
    if (!formData.password) newErrors.password = 'Palavra-passe é obrigatória'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As palavras-passe não coincidem'
    }

    // Se houver erros, mostra-os e não submete
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    console.log('Register:', formData)
    // TODO: Chamar API de registo
  }

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-header">
          <h1>🐾 WildLog</h1>
          <p className="auth-title">Criar Conta</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Campo: Utilizador */}
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
            {/* Renderização condicional: mostra erro só se existir */}
            {errors.username && <span className="error">{errors.username}</span>}
          </div>

          {/* Campo: Email */}
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

          {/* Campo: Palavra-passe */}
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

          {/* Campo: Confirmar Palavra-passe */}
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

