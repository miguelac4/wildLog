import { Heart, MessageCircle, Search } from 'lucide-react'
import useLenisContainer from '../hooks/useLenisContainer'

function FeedView({ posts, onViewPost }) {
    const feedRef = useLenisContainer()

    return (
        <div className="main-feed" ref={feedRef}>
            <div className="main-feed__container">
                <div className="main-feed__header">
                    <h2>Community Feed</h2>
                    <p>Discover the latest posts shared by the WildLog community.</p>
                </div>

                <div className="main-feed__list">
                    {posts.map((post) => (
                        <article key={post.id} className="main-feed-card">
                            <div className="main-feed-card__meta">
                                <span>@{post.author}</span>
                                <span>{post.createdAt}</span>
                            </div>

                            <h3 className="main-feed-card__title">{post.title}</h3>
                            <p className="main-feed-card__desc">{post.description}</p>

                            <div className="main-feed-card__tags">
                                {post.tags.map((tag) => (
                                    <span key={tag} className="main-feed-card__tag">#{tag}</span>
                                ))}
                            </div>

                            <div className="main-feed-card__footer">
                                <span><Heart size={14} /> {post.likes}</span>
                                <span><MessageCircle size={14} /> {post.comments}</span>

                                <button
                                    type="button"
                                    className="main-feed-card__view-btn"
                                    onClick={() => onViewPost(post)}
                                >
                                    View post
                                </button>
                            </div>
                        </article>
                    ))}

                    {posts.length === 0 && (
                        <div className="main-sidebar__empty">
                            <Search size={32} />
                            <p>No posts found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FeedView