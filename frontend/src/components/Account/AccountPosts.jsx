import { useState, useEffect } from 'react'
import { Grid3X3, Camera, Globe, Lock, Bookmark } from 'lucide-react'
import '../../styles/Account.css'
import { postExploreService } from '../../api/postExploreService'
import { normalizeImageUrl } from '../../config/mediaConfig'

function AccountPosts({ posts = [], bookmarkedIds = new Set(), onPostClick }) {
    const [visibilityFilter, setVisibilityFilter] = useState('public') // 'public' | 'private' | 'bookmarked'
    const [bookmarkedPosts, setBookmarkedPosts] = useState([])
    const [loadingBookmarks, setLoadingBookmarks] = useState(false)

    useEffect(() => {
        if (visibilityFilter === 'bookmarked' && bookmarkedPosts.length === 0 && bookmarkedIds.size > 0 && !loadingBookmarks) {
            setLoadingBookmarks(true)
            const ids = Array.from(bookmarkedIds)
            Promise.all(ids.map(id => postExploreService.getPost(id)))
                .then(responses => {
                    const validPosts = responses.map(r => {
                        if (!r.post) return null;
                        const p = r.post;
                        
                        // Normalizar tags
                        const tagsArray = Array.isArray(p.tags) 
                            ? p.tags 
                            : (p.tags ? p.tags.split(',').map(t => t.trim()) : []);

                        const imagesArray = Array.isArray(p.images)
                            ? p.images.map(img => normalizeImageUrl(img.image_url || img))
                            : [];

                        return {
                            ...p,
                            tags: tagsArray,
                            images: imagesArray,
                            lat: Number(p.lat),
                            lng: Number(p.lng)
                        };
                    }).filter(Boolean);
                    
                    setBookmarkedPosts(validPosts)
                })
                .catch(err => console.error("Error loading bookmarks", err))
                .finally(() => setLoadingBookmarks(false))
        }
    }, [visibilityFilter, bookmarkedIds, bookmarkedPosts.length])

    // Se a pessoa não tiver posts, mostramos uns de placeholder para veres o layout
    const allPosts = posts.length > 0 ? posts : [
        { id: 101, title: 'Serra da Estrela', image: '/wildlog/media/post/ferreira_1.jpeg', likes: 45, comments: 5, author: 'tu', tags: ['montanha'], createdAt: '2026-03-10', visibility: 'public' },
        { id: 102, title: 'Praia Secreta', image: '/wildlog/media/post/ericeira_1.jpeg', likes: 112, comments: 14, author: 'tu', tags: ['mar'], createdAt: '2026-02-28', visibility: 'private' },
        { id: 103, title: 'Floresta Densa', image: '/wildlog/media/post/norway_1.jpeg', likes: 89, comments: 2, author: 'tu', tags: ['floresta'], createdAt: '2026-01-15', visibility: 'public' },
    ]

    // Filtra os posts consoante o tab selecionado
    // Nota: Por defeito, os posts normais são assumidos como 'public' a menos que especifiquem 'private'
    const displayPosts = visibilityFilter === 'bookmarked' 
        ? bookmarkedPosts 
        : allPosts.filter(post => 
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
                    <button 
                        className={`account-filter-btn ${visibilityFilter === 'bookmarked' ? 'active' : ''}`}
                        onClick={() => setVisibilityFilter('bookmarked')}
                    >
                        <Bookmark size={16} />
                        Bookmarks
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
                                <img src={normalizeImageUrl(post.image || (post.images[0]?.image_url || post.images[0]))} alt={post.title} />
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
                        {visibilityFilter === 'bookmarked' 
                            ? 'Ainda não guardaste nenhuma publicação nos teus favoritos.'
                            : `Sem publicações ${visibilityFilter === 'public' ? 'comunitárias' : 'privadas'} para mostrar.`
                        }
                    </div>
                )}
            </div>
        </>
    )
}

export default AccountPosts