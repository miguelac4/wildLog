import { X, Camera, Heart, MessageCircle, MapPin, ChevronLeft, ChevronRight, Send, Edit3, Trash2, Bookmark } from 'lucide-react'
import { useState, useEffect, useRef, useContext, useCallback } from 'react'
import { AuthContext } from '../context/AuthContext'
import { postCommentService } from '../api/postCommentService'
import { postBookmarkService } from '../api/postBookmarkService'
import EditPostModal from './EditPostModal'
import { normalizeImageUrl } from '../config/mediaConfig'

function PostDetailPanel({ post: initialPost, onClose, isBookmarked = false, onToggleBookmark }) {
    if (!initialPost) return null

    const [post, setPost] = useState(initialPost)
    const { user } = useContext(AuthContext)
    const isAuthor = user && (user.username === post.author || user.id === post.user_id || user.name === post.author)

    const [imageIndex, setImageIndex] = useState(0)
    const [slideDirection, setSlideDirection] = useState(null) // 'left' | 'right'
    const [isAnimating, setIsAnimating] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [comments, setComments] = useState([])
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(null)
    const cardRef = useRef(null)

    const touchStartX = useRef(0)
    const touchEndX = useRef(0)
    const dragOffsetX = useRef(0)
    const isDragging = useRef(false)
    const imageContainerRef = useRef(null)

    const images = post.images || (post.image ? [post.image] : [])

    useEffect(() => {
        setPost(initialPost)
    }, [initialPost])



    useEffect(() => {
        if (!post) return

        setImageIndex(0)
        setSlideDirection(null)
        setIsAnimating(false)

        if (cardRef.current) {
            cardRef.current.scrollTo({ top: 0, behavior: 'smooth' })
        }

        // Fetch comments
        const fetchComments = async () => {
            try {
                const res = await postCommentService.getComments({ postId: post.id })
                setComments(res.comments || [])
            } catch (err) {
                console.error('Error fetching comments', err)
            }
        }

        fetchComments()
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

    const handleCommentSubmit = async (e) => {
        e.preventDefault()
        if (!commentText.trim()) return

        try {
            const res = await postCommentService.createComment({
                postId: post.id,
                comment: commentText
            })

            // Atualizar UI imediatamente (optimistic update)
            const newComment = {
                id: res.comment_id,
                comment: res.comment,
                created_at: new Date().toISOString(),
                username: user?.username // idealmente vir do user context
            }

            setComments((prev) => [...prev, newComment])
            setCommentText('')
        } catch (err) {
            console.error('Error creating comment', err)
        }
    }

    const handleDeleteComment = (commentId) => {
        setDeleteConfirmModal(commentId)
    }

    const confirmDeleteComment = async (commentId) => {
        try {
            await postCommentService.deleteComment({ commentId })
            setComments((prev) => prev.filter(c => c.id !== commentId))
            setDeleteConfirmModal(null)
        } catch (err) {
            console.error('Error deleting comment', err)
            setDeleteConfirmModal(null)
        }
    }

    const handleBookmarkClick = async () => {
        try {
            if (isBookmarked) {
                await postBookmarkService.unsavePost(post.id)
                if (onToggleBookmark) onToggleBookmark(post.id, false)
            } else {
                await postBookmarkService.savePost(post.id)
                if (onToggleBookmark) onToggleBookmark(post.id, true)
            }
        } catch (err) {
            console.error("Erro ao alterar bookmark:", err)
        }
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
                {isAuthor && (
                    <button className="main-post-panel__edit" onClick={() => setIsEditModalOpen(true)} style={{ position: 'absolute', top: '16px', left: '16px', background: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
                        <Edit3 size={18} color="#333" />
                    </button>
                )}
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
                                <img src={normalizeImageUrl(images[imageIndex])} alt={post.title} />
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
                    <div className="main-post-panel__meta" style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: '8px' }}>
                            <span className="main-post-panel__author">@{post.author || post.username}</span>
                            <span className="main-post-panel__date">{post.createdAt || post.created_at}</span>
                        </div>

                        {user && !isAuthor && (
                            <button
                                onClick={handleBookmarkClick}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '4px'
                                }}
                                title={isBookmarked ? "Remover Bookmark" : "Guardar Bookmark"}
                            >
                                <Bookmark
                                    size={20}
                                    fill={isBookmarked ? "#f97316" : "none"}
                                    color={isBookmarked ? "#f97316" : "#333"}
                                />
                            </button>
                        )}
                    </div>

                    <h2 className="main-post-panel__title">{post.title}</h2>
                    <p className="main-post-panel__desc">{post.description}</p>

                    <div className="main-post-panel__tags">
                        {post.tags && post.tags.map((tag) => {
                            const tagId = tag.id || tag;
                            const tagName = tag.name || tag;
                            return (
                                <span key={tagId} className="main-post-panel__tag">#{tagName}</span>
                            );
                        })}
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
                        {comments.map((c) => (
                            <div key={c.id} className="main-post-panel__comment" style={{ position: 'relative' }}>
                                <div className="main-post-panel__comment-header">
                                    <span className="main-post-panel__comment-author">
                                        @{c.username}
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span className="main-post-panel__comment-time">
                                            {c.created_at}
                                        </span>
                                        {user && c.username === user.username && (
                                            <button
                                                className="main-post-panel__comment-delete"
                                                onClick={() => handleDeleteComment(c.id)}
                                                title="Delete comment"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="main-post-panel__comment-text">{c.comment_text || c.comment || c.text}</p>
                            </div>
                        ))}
                        {comments.length === 0 && <p style={{ color: '#888', fontSize: '14px', fontStyle: 'italic', marginBottom: '16px' }}>Sem comentários.</p>}
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

            {isEditModalOpen && (
                <EditPostModal
                    post={post}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={(updatedPost) => {
                        if (!updatedPost) {
                            setIsEditModalOpen(false)
                            onClose() // the post was deleted!
                            window.location.reload()
                        } else {
                            setPost(updatedPost)
                            setIsEditModalOpen(false)
                        }
                    }}
                />
            )}

            {/* ── Delete Confirmation Modal ── */}
            {deleteConfirmModal && (
                <div className="delete-modal-overlay" onClick={() => setDeleteConfirmModal(null)}>
                    <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-modal__header">
                            <Trash2 size={20} color="#a0845f" />
                            <h3 className="delete-modal__title">Delete Comment</h3>
                        </div>
                        <p className="delete-modal__message">
                            Are you sure you want to delete this comment? This action cannot be undone.
                        </p>
                        <div className="delete-modal__actions">
                            <button
                                className="delete-modal__button delete-modal__button--cancel"
                                onClick={() => setDeleteConfirmModal(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="delete-modal__button delete-modal__button--confirm"
                                onClick={() => confirmDeleteComment(deleteConfirmModal)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PostDetailPanel