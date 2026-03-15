import { useState } from 'react'
import { Grid3X3, Camera } from 'lucide-react'
import PostDetailPanel from '../PostDetailPanel' // Ajusta o caminho se necessário!
import '../../styles/Account.css'

function AccountPosts({ posts = [] }) {
    // Estado para saber que post está aberto no painel detalhado
    const [selectedPost, setSelectedPost] = useState(null)

    // Se a pessoa não tiver posts, mostramos uns de placeholder para veres o layout
    const displayPosts = posts.length > 0 ? posts : [
        { id: 101, title: 'Serra da Estrela', image: '/wildlog/media/post/ferreira_1.jpeg', likes: 45, comments: 5, author: 'tu', tags: ['montanha'], createdAt: '2026-03-10' },
        { id: 102, title: 'Praia Secreta', image: '/wildlog/media/post/ericeira_1.jpeg', likes: 112, comments: 14, author: 'tu', tags: ['mar'], createdAt: '2026-02-28' },
        { id: 103, title: 'Floresta Densa', image: '/wildlog/media/post/norway_1.jpeg', likes: 89, comments: 2, author: 'tu', tags: ['floresta'], createdAt: '2026-01-15' },
    ]

    return (
        <>
            <h3 className="account-section-title">
                <Grid3X3 size={20} />
                Minhas Publicações
            </h3>

            <div className="account-posts-grid">
                {displayPosts.map(post => (
                    <div
                        key={post.id}
                        className="account-post-item"
                        onClick={() => setSelectedPost(post)}
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
                ))}
            </div>

            {/* O Painel Mágico que já tinham criado! */}
            {selectedPost && (
                <PostDetailPanel
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                />
            )}
        </>
    )
}

export default AccountPosts