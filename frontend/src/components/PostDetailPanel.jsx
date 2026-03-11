import { X, Camera, Heart, MessageCircle, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

function PostDetailPanel({ post, onClose }) {
    if (!post) return null

    const [imageIndex, setImageIndex] = useState(0)

    const images = post.images || (post.image ? [post.image] : [])


    useEffect(() => {
        setImageIndex(0)
    }, [post])

    const prevImage = () => {
        setImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))
    }

    const nextImage = () => {
        setImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))
    }

    return (
        <div className="main-post-panel">
            <div className="main-post-panel__backdrop" onClick={onClose} />
            <div className="main-post-panel__card">
                <button className="main-post-panel__close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="main-post-panel__image">
                    {images.length > 0 ? (
                        <>
                            <img src={images[imageIndex]} alt={post.title} />

                            {images.length > 1 && (
                                <div className="main-post-panel__dots">
                                    {images.map((_, index) => (
                                        <span
                                            key={index}
                                            className={`main-post-panel__dot ${
                                                index === imageIndex ? 'main-post-panel__dot--active' : ''
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
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            prevImage()
                                        }}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <button
                                        className="main-post-panel__nav main-post-panel__nav--right"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            nextImage()
                                        }}
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