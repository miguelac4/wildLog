import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { validateMediaPaths } from './utils/validateMediaPaths'

// Validar caminhos de mídia em desenvolvimento
if (import.meta.env.DEV) {
  validateMediaPaths()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
