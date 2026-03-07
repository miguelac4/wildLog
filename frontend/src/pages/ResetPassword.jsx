import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MEDIA_URLS } from '../config/mediaConfig'
import SpotlightCard from '../components/SpotlightCard'
import { KeyRound, ShieldCheck, Leaf, Compass, Trees, HandHeart } from 'lucide-react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import '../styles/Auth.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const FEATURE_CARDS = [
    {
        Icon: KeyRound,
        title: 'Secure Recovery',
        text: 'Reset your password safely and regain access to your WildLog account.'
    },
    {
        Icon: ShieldCheck,
        title: 'Protected Access',
        text: 'Your reset link is private, temporary, and designed to keep your account secure.'
    },
    {
        Icon: Leaf,
        title: 'Back to the Wild',
        text: 'Update your password and return to sharing your outdoor discoveries.'
    },
    {
        Icon: Compass,
        title: 'Continue Exploring',
        text: 'Recover your account and keep discovering places, stories, and experiences.'
    },
    {
        Icon: Trees,
        title: 'Reconnect with Nature',
        text: 'Get back into WildLog and continue logging the places that inspire you.'
    },
    {
        Icon: HandHeart,
        title: 'Stay Connected',
        text: 'Recover access to your account and remain part of the WildLog community.'
    },
]

function ResetPassword() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    console.log('ResetPassword rendered')
    console.log('token:', token)

    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [alertMessage, setAlertMessage] = useState('')
    const [alertSeverity, setAlertSeverity] = useState('info')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [successOpen, setSuccessOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const randomCard = useMemo(
        () => FEATURE_CARDS[Math.floor(Math.random() * FEATURE_CARDS.length)],
        []
    )

    const handleSubmit = async (e) => {
        e.preventDefault()

        setAlertMessage('')

        if (!token) {
            setAlertSeverity('error')
            setAlertMessage('Invalid or missing reset token.')
            return
        }

        if (newPassword !== confirmPassword) {
            setAlertSeverity('warning')
            setAlertMessage('Passwords do not match.')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch(`${API_BASE_URL}/auth/pass_recover_reset.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    new_password: newPassword,
                    confirm_password: confirmPassword,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 400) {
                    setAlertSeverity('warning')
                    setAlertMessage(data.message || 'Please check the provided data.')
                } else if (response.status === 401) {
                    setAlertSeverity('error')
                    setAlertMessage(data.message || 'This reset link is invalid or has expired.')
                } else {
                    setAlertSeverity('error')
                    setAlertMessage(data.message || 'An unexpected error occurred. Please try again later.')
                }
                return
            }

            setSuccessMessage(data.message || 'Password updated successfully! Redirecting to login...')
            setSuccessOpen(true)

            setTimeout(() => {
                navigate('/login')
            }, 1500)
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
                            <h1>Reset Password</h1>
                            <p>Create a new password to recover access to your account.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>

                            {alertMessage && (
                                <Alert severity={alertSeverity} sx={{ mb: 2 }}>
                                    {alertMessage}
                                </Alert>
                            )}

                            <button type="submit" className="btn btn-submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Updating Password...' : 'Reset Password'}
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
                        <h2>Password Recovery</h2>
                        <p>
                            Secure your account and get back to exploring, sharing, and discovering
                            nature with the WildLog community.
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
                autoHideDuration={1500}
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

export default ResetPassword