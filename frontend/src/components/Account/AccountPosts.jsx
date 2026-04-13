import { useState, useEffect } from 'react'
import { Grid3X3, Camera, Globe, Lock, Bookmark, Heart, MessageCircle, Search } from 'lucide-react'
import '../../styles/Account.css'
import { postExploreService } from '../../api/postExploreService'
import { normalizeImageUrl } from '../../config/mediaConfig'
import WildLogSpinner from '../WildLogSpinner'

/**
 * AccountPosts — Grid of user's posts with Public/Private/Bookmarked tabs.
 *
 * Props:
 *   posts          — user's own posts (from postUserService.getUserPosts())
 *   bookmarkedIds  — Set of bookmarked post IDs
 *   onPostClick    — callback when a post is clicked
 *   loading        — whether posts are still being fetched
 */
function AccountPosts({ posts = [], bookmarkedIds = new Set(), onPostClick, loading = false }) {
    const [visibilityFilter, setVisibilityFilter] = useState('public')
    const [bookmarkedPosts, setBookmarkedPosts] = useState([])
    const [loadingBookmarks, setLoadingBookmarks] = useState(false)

    // Fetch full bookmarked post data when the Bookmarks tab is activated
    useEffect(() => {
        if (visibilityFilter !== 'bookmarked') return
        if (bookmarkedPosts.length > 0 || bookmarkedIds.size === 0 || loadingBookmarks) return

        setLoadingBookmarks(true)
        const ids = Array.from(bookmarkedIds)

        Promise.all(ids.map(id => postExploreService.getPost(id).catch(() => null)))
            .then(responses => {
                const valid = responses
                    .filter(r => r?.post)
                    .map(r => {
                        const p = r.post
                        return {
                            ...p,
                            tags: Array.isArray(p.tags)
                                ? p.tags
                                : (p.tags ? p.tags.split(',').map(t => t.trim()) : []),
                            images: Array.isArray(p.images)
                                ? p.images.map(img => normalizeImageUrl(img.image_url || img))
                                : [],
                        }
                    })
                setBookmarkedPosts(valid)
            })
            .catch(err => console.error('Error loading bookmarks:', err))
            .finally(() => setLoadingBookmarks(false))
    }, [visibilityFilter, bookmarkedIds])

    // Filter posts by selected tab
    const displayPosts = visibilityFilter === 'bookmarked'
        ? bookmarkedPosts
        : posts.filter(p => {
            if (visibilityFilter === 'private') return p.visibility === 'private'
            return p.visibility !== 'private' // public or undefined
        })

    const isLoading = loading || (visibilityFilter === 'bookmarked' && loadingBookmarks)

    const getFirstImage = (post) => {
        if (post.images?.length > 0) {
            const img = post.images[0]
            return normalizeImageUrl(img.url || img.image_url || img)
        }
        if (post.image) return normalizeImageUrl(post.image)
        return null
    }

    const emptyMessage = visibilityFilter === 'bookmarked'
        ? 'No bookmarked posts yet.'
        : visibilityFilter === 'private'
            ? 'No private posts.'
            : 'No public posts yet.'

    return (
        <>
            <div className="account-posts-header">
                <h3 className="account-section-title">
                    <Grid3X3 size={18} />
                    My Posts
                </h3>

                <div className="account-posts-filter">
                    <button
                        className={`account-filter-btn ${visibilityFilter === 'public' ? 'active' : ''}`}
                        onClick={() => setVisibilityFilter('public')}
                    >
                        <Globe size={14} /> Public
                    </button>
                    <button
                        className={`account-filter-btn ${visibilityFilter === 'private' ? 'active' : ''}`}
                        onClick={() => setVisibilityFilter('private')}
                    >
                        <Lock size={14} /> Private
                    </button>
                    <button
                        className={`account-filter-btn ${visibilityFilter === 'bookmarked' ? 'active' : ''}`}
                        onClick={() => setVisibilityFilter('bookmarked')}
                    >
                        <Bookmark size={14} /> Saved
                    </button>
                </div>
            </div>

            <div className="account-posts-grid">
                {isLoading ? (
                    <div className="account-posts-empty">
                        <WildLogSpinner size={52} message="Loading" overlay={false} />
                    </div>
                ) : displayPosts.length > 0 ? (
                    displayPosts.map(post => {
                        const imgSrc = getFirstImage(post)
                        return (
                            <div
                                key={post.id}
                                className="account-post-item"
                                onClick={() => onPostClick?.(post)}
                            >
                                {/* Visibility badge */}
                                {visibilityFilter !== 'bookmarked' && (
                                    <span className={`account-post-badge account-post-badge--${post.visibility || 'public'}`}>
                                        {post.visibility === 'private' ? <Lock size={10} /> : <Globe size={10} />}
                                        {post.visibility === 'private' ? 'Private' : 'Public'}
                                    </span>
                                )}
                                {visibilityFilter === 'bookmarked' && (
                                    <span className="account-post-badge account-post-badge--bookmarked">
                                        <Bookmark size={10} /> Saved
                                    </span>
                                )}

                                {imgSrc ? (
                                    <img src={imgSrc} alt={post.title} loading="lazy" />
                                ) : (
                                    <div className="account-post-no-image">
                                        <Camera size={28} />
                                    </div>
                                )}

                                <div className="account-post-overlay">
                                    <p className="account-post-overlay__title">{post.title}</p>
                                    <div className="account-post-overlay__stats">
                                        <span><Heart size={11} /> {post.likes || 0}</span>
                                        <span><MessageCircle size={11} /> {post.comments || 0}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="account-posts-empty">
                        <Search size={36} />
                        <p>{emptyMessage}</p>
                    </div>
                )}
            </div>
        </>
    )
}

export default AccountPosts