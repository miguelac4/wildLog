import { X, Camera, Heart, MessageCircle, MapPin, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'

function PostDetailPanel({ post, onClose }) {
    if (!post) return null

    const [imageIndex, setImageIndex] = useState(0)
    const [slideDirection, setSlideDirection] = useState(null) // 'left' | 'right'
    const [isAnimating, setIsAnimating] = useState(false)
    const [commentText, setCommentText] = useState('')
    const cardRef = useRef(null)

    const touchStartX = useRef(0)
    const touchEndX = useRef(0)
    const dragOffsetX = useRef(0)
    const isDragging = useRef(false)
    const imageContainerRef = useRef(null)

    const images = post.images || (post.image ? [post.image] : [])

    useEffect(() => {
        setImageIndex(0)
        setSlideDirection(null)
        setIsAnimating(false)
        if (cardRef.current) {
            cardRef.current.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [post])

    const animateToIndex = useCallback((newIndex, direction) => {
        if (isAnimating) return
        setSlideDirection(direction)
        setIsAnimating(true)

        // Wait for the CSS transition to finish before updating index
        requestAnimationFrame(() => {
            setTimeout(() => {
                setImageIndex(newIndex)
                setSlideDirection(null)
                setIsAnimating(false)
            }, 380) // match CSS transition duration
        })
    }, [isAnimating])

    const prevImage = () => {
        if (isAnimating || images.length <= 1) return
        const newIdx = imageIndex === 0 ? images.length - 1 : imageIndex - 1
        animateToIndex(newIdx, 'right')
    }

    const nextImage = () => {
        if (isAnimating || images.length <= 1) return
        const newIdx = imageIndex === images.length - 1 ? 0 : imageIndex + 1
        animateToIndex(newIdx, 'left')
    }

    const handleCommentSubmit = (e) => {
        e.preventDefault()
        if (!commentText.trim()) return
        console.log('Comment:', commentText)
        setCommentText('')
    }

    const handleTouchStart = (e) => {
        if (isAnimating) return
        touchStartX.current = e.touches[0].clientX
        touchEndX.current = e.touches[0].clientX
        dragOffsetX.current = 0
        isDragging.current = true

        if (imageContainerRef.current) {
            imageContainerRef.current.style.transition = 'none'
        }
    }

    const handleTouchMove = (e) => {
        if (!isDragging.current) return
        touchEndX.current = e.touches[0].clientX
        dragOffsetX.current = touchEndX.current - touchStartX.current

        if (imageContainerRef.current) {
            imageContainerRef.current.style.transform = `translateX(${dragOffsetX.current}px)`
            imageContainerRef.current.style.opacity = Math.max(0.5, 1 - Math.abs(dragOffsetX.current) / 600)
        }
    }

    const handleTouchEnd = () => {
        if (!isDragging.current) return
        isDragging.current = false
        const diff = touchStartX.current - touchEndX.current

        // Reset the inline drag styles
        if (imageContainerRef.current) {
            imageContainerRef.current.style.transition = ''
            imageContainerRef.current.style.transform = ''
            imageContainerRef.current.style.opacity = ''
        }

        if (Math.abs(diff) < 50) return

        if (diff > 0) {
            nextImage()
        } else {
            prevImage()
        }
    }

    return (
        <div className="main-post-panel">
            <div className="main-post-panel__backdrop" onClick={onClose} />
            <div className="main-post-panel__card" ref={cardRef} data-lenis-prevent>
                <button className="main-post-panel__close" onClick={onClose}>
                    <X size={20} />
                </button>

                {/* ── Image section ── */}
                <div
                    className="main-post-panel__image"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {images.length > 0 ? (
                        <>
                            <div
                                ref={imageContainerRef}
                                className={
                                    'main-post-panel__image-slide' +
                                    (slideDirection === 'left' ? ' main-post-panel__image-slide--exit-left' : '') +
                                    (slideDirection === 'right' ? ' main-post-panel__image-slide--exit-right' : '')
                                }
                            >
                                <img src={images[imageIndex]} alt={post.title} />
                            </div>

                            {images.length > 1 && (
                                <div className="main-post-panel__dots">
                                    {images.map((_, index) => (
                                        <span
                                            key={index}
                                            className={`main-post-panel__dot ${
                                                index === imageIndex ? 'main-post-panel__dot--active' : ''
                                            }`}
                                            onClick={() => {
                                                if (isAnimating || index === imageIndex) return
                                                animateToIndex(index, index > imageIndex ? 'left' : 'right')
                                            }}
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
                            <MessageCircle size={16} /> {post.comments?.length || 0} comments
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
                        {post.comments?.map((c) => (
                            <div key={c.id} className="main-post-panel__comment">
                                <div className="main-post-panel__comment-header">
                                    <span className="main-post-panel__comment-author">@{c.author}</span>
                                    <span className="main-post-panel__comment-time">{c.created_at}</span>
                                </div>
                                <p className="main-post-panel__comment-text">{c.comment}</p>
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