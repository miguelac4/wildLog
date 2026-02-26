import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

function App() {
  // Detecta o basename baseado no hostname
  const getBaseName = () => {
    const hostname = window.location.hostname;

    // wild-log.com na raiz
    if (hostname.includes('wild-log.com') || hostname.includes('www.wild-log.com')) {
      return '';
    }

    // rh360.pt em subpasta
    return '/wildlog';
  };

  const basename = getBaseName();

  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App
