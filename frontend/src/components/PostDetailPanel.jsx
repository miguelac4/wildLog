import { X, Camera, Heart, MessageCircle, MapPin } from 'lucide-react'

function PostDetailPanel({ post, onClose }) {
    if (!post) return null

    return (
        <div className="main-post-panel">
            <div className="main-post-panel__backdrop" onClick={onClose} />
            <div className="main-post-panel__card">
                <button className="main-post-panel__close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="main-post-panel__image">
                    {post.image ? (
                        <img src={post.image} alt={post.title} />
                    ) : (
                        <div className="main-post-panel__image-placeholder">
                            <Camera size={40} />
                        </div>
                    )}
                </div>

                <div className="main-post-panel__body">
                    <div className="main-post-panel__meta">
                        <span className="main-post-panel__author">@{post.author}</span>
                        <span className="main-post-panel__date">{post.createdAt}</span>
                    </div>

                    <h2 className="main-post-panel__title">{post.title}</h2>
                    <p className="main-post-panel__desc">{post.description}</p>

                    <div className="main-post-panel__tags">
                        {post.tags.map((tag) => (
                            <span key={tag} className="main-post-panel__tag">#{tag}</span>
                        ))}
                    </div>

                    <div className="main-post-panel__stats">
            <span className="main-post-panel__stat">
              <Heart size={16} /> {post.likes} likes
            </span>
                        <span className="main-post-panel__stat">
              <MessageCircle size={16} /> {post.comments} comments
            </span>
                    </div>

                    <div className="main-post-panel__location">
                        <MapPin size={14} color="#a0845f" />
                        <span>{post.lat}° N, {post.lng}° W</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PostDetailPanel