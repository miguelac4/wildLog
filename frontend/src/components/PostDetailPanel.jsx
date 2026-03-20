import { X, Camera, Heart, MessageCircle, MapPin, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

/**
 * Mock comments — replace with API data later
 */
const MOCK_COMMENTS = [
    { id: 1, author: 'trailrunner88', text: 'Incredible spot! Adding this to my list.', time: '2h ago' },
    { id: 2, author: 'mountain_soul', text: 'Was there last summer, truly magical place.', time: '5h ago' },
    { id: 3, author: 'nature_lens', text: 'The light in that photo is stunning 📸', time: '1d ago' },
]

function PostDetailPanel({ post, onClose }) {
    if (!post) return null

    const [imageIndex, setImageIndex] = useState(0)
    const [commentText, setCommentText] = useState('')
    const cardRef = useRef(null)

    const images = post.images || (post.image ? [post.image] : [])

    useEffect(() => {
        setImageIndex(0)
        // Scroll the panel to the top smoothly when a new post opens
        if (cardRef.current) {
            cardRef.current.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [post])

    const prevImage = () => {
        setImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))
    }

    const nextImage = () => {
        setImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))
    }

    const handleCommentSubmit = (e) => {
        e.preventDefault()
        if (!commentText.trim()) return
        // TODO: POST /api/posts/:id/comments
        console.log('Comment:', commentText)
        setCommentText('')
    }

    return (
        <div className="main-post-panel">
            <div className="main-post-panel__backdrop" onClick={onClose} />
            <div className="main-post-panel__card" ref={cardRef} data-lenis-prevent>
                <button className="main-post-panel__close" onClick={onClose}>
                    <X size={20} />
                </button>

                {/* ── Image section ── */}
                <div className="main-post-panel__image">
                    {images.length > 0 ? (
                        <>
                            <img src={images[imageIndex]} alt={post.title} />

                            {images.length > 1 && (
                                <div className="main-post-panel__dots">
                                    {images.map((_, index) => (
                                        <span
                                            key={index}
                                            className={`main-post-panel__dot ${index === imageIndex ? 'main-post-panel__dot--active' : ''
                                                }`}
                                            onClick={() => setImageIndex(index)}
                                        />
                                    ))}
                                </div>
                            )}

                            {images.length > 1 && (
                                <>
                                    <button
                                        className="main-post-panel__nav main-post-panel__nav--left"
                                        onClick={(e) => { e.stopPropagation(); prevImage() }}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        className="main-post-panel__nav main-post-panel__nav--right"
                                        onClick={(e) => { e.stopPropagation(); nextImage() }}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="main-post-panel__image-placeholder">
                            <Camera size={40} />
                        </div>
                    )}
                </div>

                {/* ── Content body ── */}
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

                {/* ── Comments section ── */}
                <div className="main-post-panel__comments">
                    <h3 className="main-post-panel__comments-title">
                        <MessageCircle size={16} />
                        Comments
                    </h3>

                    <div className="main-post-panel__comments-list">
                        {MOCK_COMMENTS.map((c) => (
                            <div key={c.id} className="main-post-panel__comment">
                                <div className="main-post-panel__comment-header">
                                    <span className="main-post-panel__comment-author">@{c.author}</span>
                                    <span className="main-post-panel__comment-time">{c.time}</span>
                                </div>
                                <p className="main-post-panel__comment-text">{c.text}</p>
                            </div>
                        ))}
                    </div>

                    <form className="main-post-panel__comment-form" onSubmit={handleCommentSubmit}>
                        <input
                            type="text"
                            className="main-post-panel__comment-input"
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="main-post-panel__comment-send"
                            disabled={!commentText.trim()}
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default PostDetailPanel