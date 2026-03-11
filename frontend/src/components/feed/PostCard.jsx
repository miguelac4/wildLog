import { Heart, MessageCircle, Star, Eye, SkipBack} from 'lucide-react'

/**
 * PostCard — A single swipe card displaying post information.
 *
 * Props:
 *   post        — post object { id, author, createdAt, title, description, tags, likes, comments }
 *   onOpen      — callback when user clicks "open"
 *   onFavorite  — callback when user clicks "favorite" icon
 *   isActive    — whether this is the top (interactive) card
 */
function PostCard({ post, onOpen, onFavorite, isActive }) {
    return (
        <div className={`swipe-card ${isActive ? 'swipe-card--active' : ''}`}>
            {/* Author + date */}
            <div className="swipe-card__meta">
                <span className="swipe-card__author">@{post.author}</span>
                <span className="swipe-card__date">{post.createdAt}</span>
            </div>

            {/* Images */}
            {(post.images?.length || post.image) && (
                <div className="swipe-card__image">
                    <img src={post.images?.[0] || post.image} alt={post.title} />
                </div>
            )}


            {/* Title */}
            <h3 className="swipe-card__title">{post.title}</h3>

            {/* Description */}
            <p className="swipe-card__desc">{post.description}</p>

            {/* Tags */}
            <div className="swipe-card__tags">
                {post.tags.map((tag) => (
                    <span key={tag} className="swipe-card__tag">#{tag}</span>
                ))}
            </div>

            {/* Footer metrics */}
            <div className="swipe-card__footer">
                <span className="swipe-card__stat">
                    <Heart size={14} /> {post.likes}
                </span>
                <span className="swipe-card__stat">
                    <MessageCircle size={14} /> {post.comments}
                </span>
            </div>

            {/* Action row */}
            <div className="swipe-card__actions">
                <button
                    type="button"
                    className="swipe-card__action-btn"
                    onClick={(e) => { e.stopPropagation(); onFavorite?.(post); }}
                    title="Favorite"
                >
                    <Star size={16} />
                </button>
                <button
                    type="button"
                    className="swipe-card__action-btn swipe-card__action-btn--open"
                    onClick={(e) => { e.stopPropagation(); onOpen?.(post); }}
                    title="View post"
                >
                    <Eye size={16} />
                    <span>Open</span>
                </button>
                <button
                    type="button"
                    className="swipe-card__action-btn"
                    onClick={(e) => { e.stopPropagation(); onFavorite?.(post); }}
                    title="Comment"
                >
                    <MessageCircle size={16} />
                </button>
            </div>
        </div>
    )
}

export default PostCard
