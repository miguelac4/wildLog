import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { User, Camera, Edit2, Save, X, Image, Calendar, Check, AlertCircle } from 'lucide-react'
import '../../styles/Account.css'
import { accountService } from '../../api/accountService'
import { normalizeImageUrl } from '../../config/mediaConfig'
import WildLogSpinner from '../WildLogSpinner'
import AvatarCropModal from './AvatarCropModal'

/**
 * AccountStats — Profile header card.
 *
 * Fetches account data via accountService.getAccount() on mount.
 * Supports avatar upload (with crop modal) and inline name/bio editing.
 */
function AccountStats({ user, publicPostCount = 0, privatePostCount = 0 }) {
    const [account, setAccount] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [nameInput, setNameInput] = useState('')
    const [bioInput, setBioInput] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [alert, setAlert] = useState(null) // { type: 'success'|'error', message }
    const avatarInputRef = useRef(null)

    // Crop modal state
    const [cropImageSrc, setCropImageSrc] = useState(null)

    // Cache-busting counter — forces the browser to reload the avatar image
    const [avatarCacheBust, setAvatarCacheBust] = useState(null)

    // Fetch account data from the correct endpoint
    useEffect(() => {
        const loadAccount = async () => {
            try {
                const res = await accountService.getAccount()
                if (res.account) {
                    setAccount(res.account)
                    setNameInput(res.account.name || '')
                    setBioInput(res.account.description || '')
                }
            } catch (err) {
                console.error('Error loading account:', err)
            } finally {
                setLoading(false)
            }
        }
        loadAccount()
    }, [])

    // Auto-dismiss alerts
    useEffect(() => {
        if (!alert) return
        const t = setTimeout(() => setAlert(null), 4000)
        return () => clearTimeout(t)
    }, [alert])

    const handleStartEdit = () => {
        setNameInput(account?.name || '')
        setBioInput(account?.description || '')
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
    }

    const handleSave = async () => {
        if (!nameInput.trim()) {
            setAlert({ type: 'error', message: 'Name is required.' })
            return
        }
        setIsSaving(true)
        try {
            const res = await accountService.editAccountInfo(nameInput.trim(), bioInput.trim())
            if (res.account) {
                setAccount(prev => ({ ...prev, name: res.account.name, description: res.account.description }))
            }
            setIsEditing(false)
            setAlert({ type: 'success', message: 'Profile updated successfully!' })
        } catch (err) {
            console.error('Error updating profile:', err)
            setAlert({ type: 'error', message: err.message || 'Error updating profile.' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleAvatarClick = () => {
        avatarInputRef.current?.click()
    }

    // When a file is selected, open the crop modal instead of uploading directly
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        // Create an object URL for the cropper preview
        const objectUrl = URL.createObjectURL(file)
        setCropImageSrc(objectUrl)
        // Reset input so the same file can be re-selected later
        if (avatarInputRef.current) avatarInputRef.current.value = ''
    }

    const handleCropCancel = () => {
        if (cropImageSrc) URL.revokeObjectURL(cropImageSrc)
        setCropImageSrc(null)
    }

    const handleCropConfirm = async (croppedFile) => {
        // Close modal immediately
        if (cropImageSrc) URL.revokeObjectURL(cropImageSrc)
        setCropImageSrc(null)

        // Upload the cropped file
        setUploadingAvatar(true)
        try {
            const res = await accountService.editAvatar(croppedFile)
            if (res.account?.avatar) {
                setAccount(prev => ({
                    ...prev,
                    avatar: res.account.avatar,
                    avatar_version: res.account.avatar_version ?? Date.now(),
                }))
                setAvatarCacheBust(Date.now())
            }
            setAlert({ type: 'success', message: 'Avatar updated!' })
        } catch (err) {
            console.error('Error uploading avatar:', err)
            setAlert({ type: 'error', message: err.message || 'Error uploading avatar.' })
        } finally {
            setUploadingAvatar(false)
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        } catch { return dateStr }
    }

    if (loading) {
        return (
            <div className="account-profile" style={{ minHeight: 200 }}>
                <WildLogSpinner size={56} message="Loading" overlay={false} />
            </div>
        )
    }

    const displayName = account?.name || user?.username || 'Explorer'
    const displayBio = account?.description || ''
    // Build avatar URL with optional cache-bust to force reload after upload
    const rawAvatarUrl = account?.avatar ? normalizeImageUrl(account.avatar) : null
    const avatarVersion = account?.avatar_version || avatarCacheBust

    const avatarUrl = rawAvatarUrl
        ? `${rawAvatarUrl}${rawAvatarUrl.includes('?') ? '&' : '?'}v=${avatarVersion || 1}`
        : null

    return (
        <div className="account-profile">
            {/* Alert */}
            {alert && (
                <div className={`account-profile__alert account-profile__alert--${alert.type}`}>
                    {alert.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                    {alert.message}
                </div>
            )}

            {/* Top row: Avatar + Info */}
            <div className="account-profile__top">
                {/* Avatar with upload */}
                <div className="account-profile__avatar-wrap" onClick={handleAvatarClick} title="Change avatar">
                    <div className="account-profile__avatar">
                        {uploadingAvatar ? (
                            <WildLogSpinner size={40} overlay={false} />
                        ) : avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                style={{ borderRadius: '50%' }}
                            />
                        ) : (
                            <User size={42} strokeWidth={1.5} color="#a0845f" />
                        )}
                    </div>
                    {!uploadingAvatar && (
                        <div className="account-profile__avatar-overlay">
                            <Camera size={20} />
                        </div>
                    )}
                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="account-profile__avatar-input"
                        onChange={handleAvatarChange}
                    />
                </div>

                {/* User info */}
                <div className="account-profile__info">
                    <div className="account-profile__name-row">
                        <h2 className="account-profile__username">
                            {account?.username || user?.username || 'Explorer'}
                        </h2>
                        {!isEditing && (
                            <button className="account-profile__edit-btn" onClick={handleStartEdit}>
                                <Edit2 size={14} /> Edit
                            </button>
                        )}
                    </div>
                    {account?.email && (
                        <p className="account-profile__email">{account.email}</p>
                    )}
                    {account?.created_at && (
                        <p className="account-profile__joined">
                            <Calendar size={12} />
                            Joined {formatDate(account.created_at)}
                        </p>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="account-profile__stats">
                <div className="account-profile__stat">
                    <span className="account-profile__stat-value">{publicPostCount}</span>
                    <span className="account-profile__stat-label">
                        <Image size={12} /> Public
                    </span>
                </div>
                <div className="account-profile__stat">
                    <span className="account-profile__stat-value">{privatePostCount}</span>
                    <span className="account-profile__stat-label">
                        <Image size={12} /> Private
                    </span>
                </div>
            </div>

            {/* Bio */}
            <div className="account-profile__bio-section">
                {isEditing ? (
                    <div className="account-profile__bio-edit">
                        <input
                            className="account-profile__name-input"
                            type="text"
                            value={nameInput}
                            onChange={e => setNameInput(e.target.value)}
                            placeholder="Display name"
                            maxLength={50}
                        />
                        <textarea
                            className="account-profile__bio-textarea"
                            value={bioInput}
                            onChange={e => setBioInput(e.target.value)}
                            placeholder="Write something about yourself..."
                            maxLength={255}
                            rows={3}
                        />
                        <div className="account-profile__bio-actions">
                            <button
                                className="account-profile__bio-cancel"
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                            >
                                <X size={14} /> Cancel
                            </button>
                            <button
                                className="account-profile__bio-save"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                <Save size={14} /> {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                ) : displayBio ? (
                    <p className="account-profile__bio">{displayBio}</p>
                ) : null}
            </div>

            {/* Avatar Crop Modal — portalled to document.body to escape
                the backdrop-filter stacking context on .account-profile */}
            {cropImageSrc && createPortal(
                <AvatarCropModal
                    imageSrc={cropImageSrc}
                    onCancel={handleCropCancel}
                    onConfirm={handleCropConfirm}
                />,
                document.body
            )}
        </div>
    )
}

export default AccountStats