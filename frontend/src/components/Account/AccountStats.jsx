import { useState, useEffect } from 'react'
import { User, Image, Users, Edit2, Save, X } from 'lucide-react'
import '../../styles/Account.css'
import { authService } from '../../api/authService'
import { useAuth } from '../../hooks/useAuth'

function AccountStats({ user, publicPostCount = 0 }) {
    const { refreshUser } = useAuth()
    const [isEditingBio, setIsEditingBio] = useState(false)
    const [bioInput, setBioInput] = useState(user?.description || user?.bio || "")
    const [fetchedBio, setFetchedBio] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    // Sync from database directly on mount
    useEffect(() => {
        const loadBio = async () => {
            if (!user?.id) return;
            try {
                const res = await authService.getProfile();
                if (res.account) {
                    setFetchedBio(res.account.description || "");
                    setBioInput(res.account.description || "");
                }
            } catch (error) {
                console.error("Erro ao carregar biografia", error);
            }
        };
        loadBio();
    }, [user?.id])

    const handleSaveBio = async () => {
        try {
            setIsSaving(true)
            const res = await authService.updateProfile(user?.username || user?.name || "User", bioInput)
            if (res.account) {
                setFetchedBio(res.account.description || "");
            }
            setIsEditingBio(false)
        } catch (error) {
            console.error("Erro ao atualizar biografia", error)
            alert("Erro ao atualizar biografia")
        } finally {
            setIsSaving(false)
        }
    }

    const stats = [
        { label: 'Publicações', value: publicPostCount.toString(), icon: Image },
        { label: 'Seguidores', value: '348', icon: Users },
        { label: 'A Seguir', value: '156', icon: Users },
    ]

    const displayBio = fetchedBio || user?.description || user?.bio || ""

    return (
        <div className="account-stats-inner">
            <div className="account-stats-header">
                {/* Avatar Grande */}
                <div className="account-stats-avatar">
                    <User size={50} strokeWidth={1.5} color="#a0845f" />
                </div>

                {/* Grelha de Números */}
                <div className="account-stats-numbers">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <div key={index} className="account-number-box">
                                <span className="account-number-val">{stat.value}</span>
                                <span className="account-number-label">
                                    <Icon size={12} style={{ marginRight: '4px', marginBottom: '-2px' }} />
                                    {stat.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Info Principal */}
            <div className="account-stats-info">
                <div className="account-stats-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 className="account-stats-name">{user?.username || 'Explorador'}</h2>
                    {!isEditingBio && (
                        <button
                            onClick={() => setIsEditingBio(true)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0845f', padding: '0', display: 'flex' }}
                            title="Editar Biografia"
                        >
                            <Edit2 size={16} />
                        </button>
                    )}
                </div>

                {isEditingBio ? (
                    <div style={{ marginTop: '10px' }}>
                        <textarea
                            value={bioInput}
                            onChange={(e) => setBioInput(e.target.value)}
                            rows={3}
                            maxLength={255}
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#222', color: '#fff', fontSize: '14px', resize: 'vertical' }}
                            placeholder="Escreve um pouco sobre ti..."
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button
                                onClick={() => { setIsEditingBio(false); setBioInput(user?.description || user?.bio || ""); }}
                                disabled={isSaving}
                                style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#333', color: '#fff', fontSize: '12px' }}
                            >
                                <X size={14} /> Cancelar
                            </button>
                            <button
                                onClick={handleSaveBio}
                                disabled={isSaving}
                                style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#a0845f', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                            >
                                <Save size={14} /> {isSaving ? 'A guardar...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="account-stats-bio">{displayBio}</p>
                )}
            </div>
        </div>
    )
}

export default AccountStats