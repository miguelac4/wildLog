/**
 * AppReadyContext — Signals when the main app surface (Cesium globe) is
 * visually ready so the intro overlay can be dismissed at the right time.
 *
 * Flow:
 *   1. ExploreMap calls `signalReady()` after the Cesium viewer has
 *      initialised and painted its first frame.
 *   2. App.jsx reads `appReady` and gates intro dismissal on
 *      `animDone && appReady`.
 */
import { createContext, useContext, useState, useCallback } from 'react'

const AppReadyContext = createContext(null)

export function AppReadyProvider({ children }) {
    const [appReady, setAppReady] = useState(false)

    const signalReady = useCallback(() => setAppReady(true), [])
    const resetReady  = useCallback(() => setAppReady(false), [])

    return (
        <AppReadyContext.Provider value={{ appReady, signalReady, resetReady }}>
            {children}
        </AppReadyContext.Provider>
    )
}

export function useAppReady() {
    const ctx = useContext(AppReadyContext)
    if (!ctx) throw new Error('useAppReady must be used inside <AppReadyProvider>')
    return ctx
}


