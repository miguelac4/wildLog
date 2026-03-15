import { User, Image, Users, MapPin, Edit3 } from 'lucide-react'
import '../../styles/Account.css'

function AccountStats({ user }) {
    // Estatísticas (Mock - depois vem da API)
    const stats = [
        { label: 'Publicações', value: '12', icon: Image },
        { label: 'Seguidores', value: '348', icon: Users },
        { label: 'A Seguir', value: '156', icon: Users },
        { label: 'Marcas', value: '8', icon: MapPin },
    ]

    // Biografia de exemplo (caso o user não tenha ainda)
    const bio = user?.bio || "Amante da natureza, campismo selvagem e fotografia. A explorar os cantos mais remotos de Portugal. 🌲⛺"

    return (
        <div className="account-stats-inner">
            <div className="account-stats-header">
                {/* Avatar Grande */}
                <div className="account-stats-avatar">
                    <User size={50} strokeWidth={1.5} color="#a0845f" />
                </div>

                {/* Info Principal */}
                <div className="account-stats-info">
                    <div className="account-stats-title-row">
                        <h2 className="account-stats-name">{user?.username || 'Explorador'}</h2>
                        <button className="account-btn-edit">
                            <Edit3 size={14} />
                            Editar Perfil
                        </button>
                    </div>
                    <p className="account-stats-bio">{bio}</p>
                </div>
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
    )
}

export default AccountStats