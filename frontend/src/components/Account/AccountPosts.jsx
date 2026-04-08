import { useState } from 'react'
import { Grid3X3, Camera, Globe, Lock } from 'lucide-react'
import '../../styles/Account.css'

function AccountPosts({ posts = [], onPostClick }) {
    const [visibilityFilter, setVisibilityFilter] = useState('public') // 'public' | 'private'

    // Se a pessoa não tiver posts, mostramos uns de placeholder para veres o layout
    const allPosts = posts.length > 0 ? posts : [
        { id: 101, title: 'Serra da Estrela', image: '/wildlog/media/post/ferreira_1.jpeg', likes: 45, comments: 5, author: 'tu', tags: ['montanha'], createdAt: '2026-03-10', visibility: 'public' },
        { id: 102, title: 'Praia Secreta', image: '/wildlog/media/post/ericeira_1.jpeg', likes: 112, comments: 14, author: 'tu', tags: ['mar'], createdAt: '2026-02-28', visibility: 'private' },
        { id: 103, title: 'Floresta Densa', image: '/wildlog/media/post/norway_1.jpeg', likes: 89, comments: 2, author: 'tu', tags: ['floresta'], createdAt: '2026-01-15', visibility: 'public' },
    ]

    // Filtra os posts consoante o tab selecionado
    // Nota: Por defeito, os posts normais são assumidos como 'public' a menos que especifiquem 'private'
    const displayPosts = allPosts.filter(post => 
        post.visibility === visibilityFilter || (visibilityFilter === 'public' && !post.visibility)
    )

    return (
        <>
            <div className="account-posts-header">
                <h3 className="account-section-title">
                    <Grid3X3 size={20} />
                    Minhas Publicações
                </h3>

                <div className="account-posts-filter">
                    <button 
                        className={`account-filter-btn ${visibilityFilter === 'public' ? 'active' : ''}`}
                        onClick={() => setVisibilityFilter('public')}
                    >
                        <Globe size={16} />
                        Comunitárias
                    </button>
                    <button 
                        className={`account-filter-btn ${visibilityFilter === 'private' ? 'active' : ''}`}
                        onClick={() => setVisibilityFilter('private')}
                    >
                        <Lock size={16} />
                        Privadas
                    </button>
                </div>
            </div>

            <div className="account-posts-grid">
                {displayPosts.length > 0 ? (
                    displayPosts.map(post => (
                        <div
                            key={post.id}
                            className="account-post-item"
                            onClick={() => onPostClick && onPostClick(post)}
                        >
                            {/* Se tiver imagem, mostra a primeira, senão mostra um placeholder */}
                            {post.image || (post.images && post.images.length > 0) ? (
                                <img src={post.image || post.images[0]} alt={post.title} />
                            ) : (
                                <div className="account-post-no-image"><Camera size={24} /></div>
                            )}

                            {/* Efeito Hover por cima da foto */}
                            <div className="account-post-overlay">
                                <span>{post.title}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="account-posts-empty">
                        Sem publicações {visibilityFilter === 'public' ? 'comunitárias' : 'privadas'} para mostrar.
                    </div>
                )}
            </div>
        </>
    )
}

export default AccountPosts