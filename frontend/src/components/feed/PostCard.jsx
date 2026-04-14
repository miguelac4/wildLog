import { Heart, MessageCircle } from 'lucide-react'
import { normalizeImageUrl } from '../../config/mediaConfig'

/**
 * PostCard — A single swipe card displaying post information.
 *
 * Props:
 *   post        — post object { id, author, createdAt, title, description, tags, likes, comments }
 *   isActive    — whether this is the top (interactive) card
 */
function PostCard({ post, isActive }) {
    /* Resolve the first image URL — handles both string and object shapes */
    const imgSrc = (() => {
        if (post.images?.length) {
            const first = post.images[0]
            if (typeof first === 'string') return first
            return normalizeImageUrl(first.image_url || first.url || first)
        }
        if (post.image) return typeof post.image === 'string' ? post.image : normalizeImageUrl(post.image)
        return null
    })()

    return (
        <div
            className={`swipe-card ${isActive ? 'swipe-card--active' : ''}`}
        >
            {/* Author + date */}
            <div className="swipe-card__meta">
                <span className="swipe-card__author">@{post.author}</span>
                <span className="swipe-card__date">{post.createdAt}</span>
            </div>

            {/* Image — draggable=false prevents native img drag from hijacking swipe */}
            {imgSrc && (
                <div className="swipe-card__image">
                    <img
                        src={imgSrc}
                        alt={post.title}
                        draggable="false"
                        onDragStart={(e) => e.preventDefault()}
                    />
                </div>
            )}

            {/* Title */}
            <h3 className="swipe-card__title">{post.title}</h3>

            {/* Description */}
            <p className="swipe-card__desc">{post.description}</p>

            {/* Tags */}
            <div className="swipe-card__tags">
                {(post.tags || []).map((tag) => {
                    const tagName = typeof tag === 'object' ? tag.name : tag
                    const tagKey = typeof tag === 'object' ? tag.id : tag
                    return (
                        <span key={tagKey} className="swipe-card__tag">#{tagName}</span>
                    )
                })}
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
        </div>
    )
}

export default PostCard
