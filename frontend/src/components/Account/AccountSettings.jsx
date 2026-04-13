import { useState, useEffect } from 'react'
import { Lock, Trash2, AlertTriangle, Check, AlertCircle, Shield } from 'lucide-react'
import { accountService } from '../../api/accountService'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import '../../styles/Account.css'

/**
 * AccountSettings — Change password & delete account section.
 *
 * Uses accountService.changePassword() and accountService.deleteAccount().
 */
function AccountSettings() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    /* ── Change password state ── */
    const [currPassword, setCurrPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [changingPw, setChangingPw] = useState(false)
    const [pwAlert, setPwAlert] = useState(null)

    /* ── Delete account state ── */
    const [deletePassword, setDeletePassword] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState('')
    const [deletingAccount, setDeletingAccount] = useState(false)
    const [deleteAlert, setDeleteAlert] = useState(null)

    // Auto-dismiss alerts
    useEffect(() => {
        if (!pwAlert) return
        const t = setTimeout(() => setPwAlert(null), 5000)
        return () => clearTimeout(t)
    }, [pwAlert])

    useEffect(() => {
        if (!deleteAlert) return
        const t = setTimeout(() => setDeleteAlert(null), 5000)
        return () => clearTimeout(t)
    }, [deleteAlert])

    /* ── Change password handler ── */
    const handleChangePassword = async (e) => {
        e.preventDefault()

        if (!currPassword || !newPassword || !confirmPassword) {
            setPwAlert({ type: 'error', message: 'All fields are required.' })
            return
        }
        if (newPassword.length < 8) {
            setPwAlert({ type: 'error', message: 'New password must be at least 8 characters.' })
            return
        }
        if (newPassword !== confirmPassword) {
            setPwAlert({ type: 'error', message: 'New password and confirmation do not match.' })
            return
        }

        setChangingPw(true)
        try {
            await accountService.changePassword(currPassword, newPassword, confirmPassword)
            setPwAlert({ type: 'success', message: 'Password changed successfully!' })
            setCurrPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err) {
            setPwAlert({ type: 'error', message: err.message || 'Error changing password.' })
        } finally {
            setChangingPw(false)
        }
    }

    /* ── Delete account handler ── */
    const handleDeleteAccount = async (e) => {
        e.preventDefault()

        if (!deletePassword) {
            setDeleteAlert({ type: 'error', message: 'Password is required.' })
            return
        }
        if (deleteConfirm !== 'DELETE') {
            setDeleteAlert({ type: 'error', message: 'Please type DELETE to confirm.' })
            return
        }

        setDeletingAccount(true)
        try {
            await accountService.deleteAccount(deletePassword, deleteConfirm)
            await logout()
            navigate('/')
        } catch (err) {
            setDeleteAlert({ type: 'error', message: err.message || 'Error deleting account.' })
            setDeletingAccount(false)
        }
    }

    return (
        <div className="account-settings">
            {/* ── Change Password ── */}
            <div className="account-settings__card">
                <div className="account-settings__card-header">
                    <div className="account-settings__card-icon account-settings__card-icon--password">
                        <Shield size={18} />
                    </div>
                    <div>
                        <h3 className="account-settings__card-title">Change Password</h3>
                        <p className="account-settings__card-desc">Update your account password.</p>
                    </div>
                </div>

                {pwAlert && (
                    <div className={`account-profile__alert account-profile__alert--${pwAlert.type}`} style={{ marginBottom: 16 }}>
                        {pwAlert.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                        {pwAlert.message}
                    </div>
                )}

                <form className="account-settings__form" onSubmit={handleChangePassword}>
                    <div className="account-settings__field">
                        <label className="account-settings__label">Current Password</label>
                        <input
                            className="account-settings__input"
                            type="password"
                            value={currPassword}
                            onChange={e => setCurrPassword(e.target.value)}
                            placeholder="Enter current password"
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="account-settings__field">
                        <label className="account-settings__label">New Password</label>
                        <input
                            className="account-settings__input"
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="account-settings__field">
                        <label className="account-settings__label">Confirm New Password</label>
                        <input
                            className="account-settings__input"
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Repeat new password"
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        className="account-settings__submit"
                        type="submit"
                        disabled={changingPw}
                    >
                        <Lock size={16} />
                        {changingPw ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>

            {/* ── Delete Account ── */}
            <div className="account-settings__card account-settings__card--danger">
                <div className="account-settings__card-header">
                    <div className="account-settings__card-icon account-settings__card-icon--danger">
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                        <h3 className="account-settings__card-title">Delete Account</h3>
                        <p className="account-settings__card-desc">
                            Permanently delete your account and all data. This action cannot be undone.
                        </p>
                    </div>
                </div>

                {deleteAlert && (
                    <div className={`account-profile__alert account-profile__alert--${deleteAlert.type}`} style={{ marginBottom: 16 }}>
                        {deleteAlert.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                        {deleteAlert.message}
                    </div>
                )}

                <form className="account-settings__form" onSubmit={handleDeleteAccount}>
                    <div className="account-settings__field">
                        <label className="account-settings__label">Password</label>
                        <input
                            className="account-settings__input"
                            type="password"
                            value={deletePassword}
                            onChange={e => setDeletePassword(e.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="account-settings__field">
                        <label className="account-settings__label">
                            Type <strong style={{ color: '#ff6b6b' }}>DELETE</strong> to confirm
                        </label>
                        <input
                            className="account-settings__input"
                            type="text"
                            value={deleteConfirm}
                            onChange={e => setDeleteConfirm(e.target.value)}
                            placeholder="DELETE"
                            autoComplete="off"
                        />
                        <p className="account-settings__danger-hint">
                            All your posts, comments, and data will be permanently removed.
                        </p>
                    </div>

                    <button
                        className="account-settings__danger-btn"
                        type="submit"
                        disabled={deletingAccount || deleteConfirm !== 'DELETE'}
                    >
                        <Trash2 size={16} />
                        {deletingAccount ? 'Deleting...' : 'Delete Account'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AccountSettings

