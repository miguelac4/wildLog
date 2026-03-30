import { X, Camera, Heart, MessageCircle, MapPin, ChevronLeft, ChevronRight, Send, Edit3, Trash2 } from 'lucide-react'
import { useState, useEffect, useRef, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { postCommentService } from '../api/postCommentService'
import EditPostModal from './EditPostModal'



function PostDetailPanel({ post: initialPost, onClose }) {
    if (!initialPost) return null

    const [post, setPost] = useState(initialPost)
    const { user } = useContext(AuthContext)
    const isAuthor = user && (user.username === post.author || user.id === post.user_id || user.name === post.author)
    console.log("DEBUG Edit Button:", { user, postAuthor: post.author, isAuthor })

    const [imageIndex, setImageIndex] = useState(0)
    const [commentText, setCommentText] = useState('')
    const [comments, setComments] = useState([])
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const cardRef = useRef(null)

    const images = post.images || (post.image ? [post.image] : [])

    useEffect(() => {
        setPost(initialPost)
    }, [initialPost])

    useEffect(() => {
        setImageIndex(0)
        // Scroll the panel to the top smoothly when a new post opens
        if (cardRef.current) {
            cardRef.current.scrollTo({ top: 0, behavior: 'smooth' })
        }
        
        postCommentService.getComments({ postId: post.id })
            .then(res => setComments(res.comments || res || []))
            .catch(err => console.error("Erro comentários", err))
    }, [post.id])

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Queres apagar este comentário?')) return
        try {
            await postCommentService.deleteComment({ commentId })
            setComments(comments.filter(c => c.id !== commentId))
        } catch (err) {
            console.error(err)
            alert('Erro ao apagar comentário.')
        }
    }

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
                {isAuthor && (
                    <button className="main-post-panel__edit" onClick={() => setIsEditModalOpen(true)} style={{ position: 'absolute', top: '16px', left: '16px', background: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
                        <Edit3 size={18} color="#333" />
                    </button>
                )}
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
                        {comments.map((c) => (
                            <div key={c.id} className="main-post-panel__comment" style={{ position: 'relative' }}>
                                <div className="main-post-panel__comment-header">
                                    <span className="main-post-panel__comment-author">@{c.user_name || c.author || 'utilizador'}</span>
                                    <span className="main-post-panel__comment-time">{c.created_at || c.time || 'agora'}</span>
                                    {isAuthor && (
                                        <button 
                                            onClick={() => handleDeleteComment(c.id)}
                                            style={{ background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer', marginLeft: 'auto' }}
                                            title="Apagar comentário"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
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
        </div>
    )
}

export default PostDetailPanel