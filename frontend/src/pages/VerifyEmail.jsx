import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import '../styles/VerifyEmail.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export default function VerifyEmail() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [status, setStatus] = useState('loading')
    const [message, setMessage] = useState('A validar o seu email...')

    useEffect(() => {
        const token = searchParams.get('token')

        if (!token) {
            setStatus('error')
            setMessage('Token de verificação em falta.')
            return
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/auth/verify_account.php?token=${encodeURIComponent(token)}`,
                    {
                        method: 'GET',
                        credentials: 'include',
                    }
                )

                const data = await response.json()

                if (!response.ok) {
                    setStatus('error')
                    setMessage(data.message || 'Não foi possível verificar a conta.')
                    return
                }

                if (data.status === 'verified') {
                    setStatus('success')
                    setMessage(data.message || 'Conta verificada com sucesso.')
                } else if (data.status === 'already_verified') {
                    setStatus('info')
                    setMessage(data.message || 'A conta já se encontra verificada.')
                } else {
                    setStatus('error')
                    setMessage(data.message || 'Resposta inesperada do servidor.')
                    return
                }

                setTimeout(() => {
                    navigate('/login')
                }, 3000)
            } catch (error) {
                setStatus('error')
                setMessage('Ocorreu um erro ao validar o email. Tente novamente mais tarde.')
            }
        }

        verifyEmail()
    }, [searchParams, navigate])

    return (
        <main className="verify-page">
            <div className="verify-card">
                <h1>Verificação de Email</h1>

                {status === 'loading' && <p>A validar a sua conta...</p>}

                {status === 'success' && (
                    <>
                        <p>{message}</p>
                        <p>Será redirecionado para o login dentro de instantes.</p>
                    </>
                )}

                {status === 'info' && (
                    <>
                        <p>{message}</p>
                        <p>Será redirecionado para o login dentro de instantes.</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <p>{message}</p>
                        <Link to="/login">Ir para o login</Link>
                    </>
                )}
            </div>
        </main>
    )
}