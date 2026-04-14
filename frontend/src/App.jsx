import { Routes, Route, useLocation } from 'react-router-dom'
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
import { useState, useEffect, useCallback } from 'react'
import IntroLogo from './components/intro/IntroLogo'
import { useAppReady } from './context/AppReadyContext'

function App() {
    useLenis()
    const location = useLocation()

    useEffect(() => {
        if (typeof window === 'undefined') return
        if (typeof window.clarity !== 'function') return

        window.clarity('set', 'route', `${location.pathname}${location.search}`)
    }, [location.pathname, location.search])

    const { appReady, resetReady } = useAppReady()

    /* Once the intro has fully played (exit slide-up finished),
       never show it again until the user leaves /app (logout). */
    const [introCompleted, setIntroCompleted] = useState(false)

    /* ── Derive showIntro synchronously during render ─────────────
       This is evaluated in the SAME render cycle that reads the new
       location, so the overlay is guaranteed to be in the React tree
       from the very first render after navigation — no flash, no
       race condition, no useLayoutEffect timing issues.            */
    const isAppRoute =
        location.pathname === '/app' || location.pathname.startsWith('/app/')
    const showIntro = isAppRoute && !introCompleted

    /* ── Reset when leaving /app (logout / redirect) ──────────────
       This allows the intro to play again on the next login.
       Also resets appReady so the next visit waits for Cesium.     */
    useEffect(() => {
        if (!isAppRoute) {
            setIntroCompleted(false)
            resetReady()
        }
    }, [isAppRoute, resetReady])

    /* Called by IntroLogo after its exit slide-up animation finishes */
    const handleIntroComplete = useCallback(() => {
        setIntroCompleted(true)
        sessionStorage.removeItem('playIntro')
    }, [])

    return (
        <>
            {/* ── Cinematic intro overlay — present from frame 0 ── */}
            {showIntro && (
                <IntroLogo
                    appReady={appReady}
                    onComplete={handleIntroComplete}
                />
            )}

            {/*
                Routes are always mounted so Cesium initialises in the
                background while the intro plays. The overlay at z-9999
                covers everything until it slides up.
            */}
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