/**
 * ForgotPass.jsx — Página de Recuperação de Password
 *
 * Permite ao utilizador pedir um email de recuperação de password.
 * Envia o email para o endpoint:
 * POST /auth/pass_recover_request.php
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MEDIA_URLS } from '../config/mediaConfig'
import SpotlightCard from '../components/SpotlightCard'
import { Mail, ShieldCheck, Leaf, Compass, Trees, HandHeart } from 'lucide-react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import '../styles/Auth.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const FEATURE_CARDS = [
    {
        Icon: Mail,
        title: 'Recovery by Email',
        text: 'Request a secure password reset link and recover access to your WildLog account.'
    },
    {
        Icon: ShieldCheck,
        title: 'Safe Access',
        text: 'Your recovery link is temporary and designed to keep your account protected.'
    },
    {
        Icon: Leaf,
        title: 'Return to Nature',
        text: 'Recover your account and continue documenting the places and moments that matter.'
    },
    {
        Icon: Compass,
        title: 'Find Your Way Back',
        text: 'Get back into WildLog and continue exploring, sharing, and inspiring others.'
    },
    {
        Icon: Trees,
        title: 'Reconnect Securely',
        text: 'Reset access safely and keep building your journey through nature.'
    },
    {
        Icon: HandHeart,
        title: 'Stay with the Community',
        text: 'Recover your account and remain connected to fellow explorers and nature lovers.'
    },
]

function ForgotPass() {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertSeverity, setAlertSeverity] = useState('info')

    const [successOpen, setSuccessOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const navigate = useNavigate()

    const randomCard = useMemo(
        () => FEATURE_CARDS[Math.floor(Math.random() * FEATURE_CARDS.length)],
        []
    )

    const handleSubmit = async (e) => {
        e.preventDefault()

        setAlertMessage('')
        setIsSubmitting(true)

        try {
            const response = await fetch(`${API_BASE_URL}/auth/pass_recover_request.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 400) {
                    setAlertSeverity('warning')
                    setAlertMessage(data.message || 'Please enter a valid email address.')
                } else if (response.status === 429) {
                    setAlertSeverity('warning')
                    setAlertMessage(data.message || 'Too many requests. Please try again later.')
                } else {
                    setAlertSeverity('error')
                    setAlertMessage(data.message || 'An unexpected error occurred. Please try again later.')
                }
                return
            }

            setSuccessMessage(
                data.message || 'If the email exists, a password reset link has been sent.'
            )
            setSuccessOpen(true)
            setEmail('')
        } catch {
            setAlertSeverity('error')
            setAlertMessage('Unable to connect to the server. Please try again later.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <div className="auth-page">
                <div className="auth-left">
                    <div className="auth-left-inner">
                        <div className="auth-brand">
                            <span>WildLog</span>
                        </div>

                        <div className="auth-header">
                            <h1>Forgot Password</h1>
                            <p>Enter your email and we will send you a password reset link.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {alertMessage && (
                                <Alert severity={alertSeverity} sx={{ mb: 2 }}>
                                    {alertMessage}
                                </Alert>
                            )}

                            <button type="submit" className="btn btn-submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p
                                onClick={() => navigate('/login')}
                                className="link back-home"
                            >
                                ← Back to Login
                            </p>
                        </div>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-right-content">
                        <img src={MEDIA_URLS.logo} alt="WildLog" className="auth-right-logo" />
                        <h2>Recover Your Access</h2>
                        <p>
                            Request a secure reset link and return to sharing your discoveries
                            with the WildLog community.
                        </p>

                        <SpotlightCard className="auth-right-card" spotlightColor="rgba(139, 115, 85, 0.25)">
                            <randomCard.Icon color="#9B805D" strokeWidth={1.75} size={40} />
                            <h3 className="spotlight-title">{randomCard.title}</h3>
                            <p className="spotlight-text">{randomCard.text}</p>
                        </SpotlightCard>
                    </div>
                </div>
            </div>

            <Snackbar
                open={successOpen}
                autoHideDuration={4000}
                onClose={() => setSuccessOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSuccessOpen(false)}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {successMessage}
                </Alert>
            </Snackbar>
        </>
    )
}

export default ForgotPass