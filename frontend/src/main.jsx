/**
 * main.jsx — Ponto de entrada da aplicação React
 *
 * Este ficheiro é responsável por:
 *   1. Importar os estilos globais (index.css)
 *   2. Criar a "root" do React no DOM (elemento #root do index.html)
 *   3. Renderizar o componente <App /> dentro de <StrictMode>
 *
 * React.StrictMode:
 *   - Ativa verificações extra em desenvolvimento (double rendering, etc.)
 *   - Não afeta a produção (é ignorado no build final)
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'
const getRouterBasename = () => {
    if (typeof window === 'undefined') return '/wildlog'
    const host = window.location.hostname
    if (host.includes('wild-log.com')) return '/'
    return '/wildlog'
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter basename={getRouterBasename()}>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
)
