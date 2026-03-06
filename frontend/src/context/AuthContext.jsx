import { createContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../api/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const loadUser = async () => {
        try {
            const response = await authService.me()
            setUser(response.user)
        } catch (error) {
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (email, password) => {
        const response = await authService.login(email, password)
        setUser(response.user)
        return response
    }

    const logout = async () => {
        try {
            await authService.logout()
        } finally {
            setUser(null)
        }
    }

    useEffect(() => {
        loadUser()
    }, [])

    const value = useMemo(() => ({
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser: loadUser,
    }), [user, isLoading])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}