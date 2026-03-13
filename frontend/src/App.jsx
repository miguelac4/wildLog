import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Main from './pages/Main'
import useLenis from './hooks/useLenis'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPass from './pages/ForgotPass'
import ResetPassword from './pages/ResetPassword'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import IntroLogo from './components/intro/IntroLogo'

/**
 * Deteta o basename do Router com base no hostname.
 *   - wild-log.com     → "/" (raiz)
 *   - rh360.pt         → "/wildlog" (subpasta)
 *   - localhost         → "/wildlog" (dev simula rh360)
 */
function App() {
  useLenis()

  const [showIntro, setShowIntro] = useState(true)

  return (
    <>
      {/* Cinematic intro overlay — plays once on app load */}
      <AnimatePresence>
        {showIntro && (
          <IntroLogo onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<Main />} />
        </Route>
      </Routes>
    </>
  )
}

export default App