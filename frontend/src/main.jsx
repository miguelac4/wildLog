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
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
