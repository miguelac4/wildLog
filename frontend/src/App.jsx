/**
 * App.jsx — Componente raiz da aplicação
 *
 * Responsabilidades:
 *   1. Configurar o React Router (sistema de navegação SPA)
 *   2. Definir todas as rotas da aplicação
 *   3. Determinar o "basename" correto baseado no domínio
 *
 * React Router:
 *   - <BrowserRouter> usa a History API do browser (URLs limpas, sem #)
 *   - <Routes> é o container de rotas
 *   - <Route> mapeia um caminho (path) a um componente (element)
 *
 * Basename:
 *   - Em rh360.pt/wildlog → basename="/wildlog" (todas as rotas ficam /wildlog/...)
 *   - Em wild-log.com     → basename="" (rotas ficam na raiz /)
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

function App() {
  /**
   * Detecta o basename baseado no hostname atual.
   * Isto permite que o mesmo código funcione em ambos os domínios
   * sem necessidade de builds separados.
   */
  const getBaseName = () => {
    const hostname = window.location.hostname

    // wild-log.com → app na raiz do domínio
    if (hostname.includes('wild-log.com')) {
      return ''
    }

    // rh360.pt (ou qualquer outro) → app na subpasta /wildlog
    return '/wildlog'
  }

  const basename = getBaseName()

  return (
    <Router basename={basename}>
      <Routes>
        {/* Página inicial (landing page com vídeo de fundo) */}
        <Route path="/" element={<Home />} />

        {/* Página de login */}
        <Route path="/login" element={<Login />} />

        {/* Página de registo */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App
