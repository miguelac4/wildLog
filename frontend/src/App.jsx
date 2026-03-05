import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import useLenis from './hooks/useLenis'
import './App.css'

/**
 * Deteta o basename do Router com base no hostname.
 *   - wild-log.com     → "/" (raiz)
 *   - rh360.pt         → "/wildlog" (subpasta)
 *   - localhost         → "/wildlog" (dev simula rh360)
 */
const getRouterBasename = () => {
  if (typeof window === 'undefined') return '/wildlog'
  const host = window.location.hostname
  if (host.includes('wild-log.com')) return '/'
  return '/wildlog'
}

function App() {
  /* Lenis smooth scroll — efeito rubber band em toda a app */
  useLenis()

  return (
    <Router basename={getRouterBasename()}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App
