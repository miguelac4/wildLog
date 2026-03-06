import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Main from './pages/Main'
import useLenis from './hooks/useLenis'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute.jsx'

/**
 * Deteta o basename do Router com base no hostname.
 *   - wild-log.com     → "/" (raiz)
 *   - rh360.pt         → "/wildlog" (subpasta)
 *   - localhost         → "/wildlog" (dev simula rh360)
 */
function App() {
  useLenis()

  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<Main />} />
        </Route>
      </Routes>
  )
}

export default App