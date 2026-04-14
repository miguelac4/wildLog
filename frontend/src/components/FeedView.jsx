import { useEffect, useRef, useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import SwipeDeck from './feed/SwipeDeck'
import { postExploreService } from '../api/postExploreService'
import { normalizeImageUrl } from '../config/mediaConfig'
import WildLogSpinner from './WildLogSpinner'


/**
 * FeedView — Layout container for the Community Feed.
 *
 * Owns all feed state (posts, cursor, loading) and delegates
 * post rendering to SwipeDeck.
 *
 * Props:
 *   onViewPost  — callback to set the selected post (opens PostDetailPanel)
 */
function FeedView({ onViewPost }) {
    const feedRef = useRef(null)

    /* ── Feed state ── */
    const [feedPosts, setFeedPosts]     = useState([])
    const [hasMoreFeed, setHasMoreFeed] = useState(true)
    const [initialLoading, setInitialLoading] = useState(true)

    /* Ref-based loading guard — prevents StrictMode double-fetch */
    const loadingRef = useRef(false)
    const cursorRef  = useRef(null)

    /* ── Load feed ── */
    const loadFeed = useCallback(async () => {
        if (loadingRef.current || !hasMoreFeed) return
        loadingRef.current = true

        try {
            const data = await postExploreService.getFeed(cursorRef.current)

            const normalized = data.feed.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                createdAt: p.created_at,
                author: p.author,
                image: normalizeImageUrl(p.image_url),
                tags: p.tags || [],
                likes: p.likes,
                comments: p.comments,
            }))

            setFeedPosts(prev => [...prev, ...normalized])
            cursorRef.current = data.next_cursor

            if (!data.next_cursor) {
                setHasMoreFeed(false)
            }
        } catch (err) {
            console.error('Erro feed:', err)
        }

        loadingRef.current = false
        setInitialLoading(false)
    }, [hasMoreFeed])

    /* ── Initial load on mount ── */
    useEffect(() => {
        loadFeed()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Enrich post before opening detail panel ── */
    const handleViewPost = useCallback(async (post) => {
        try {
            const data = await postExploreService.getPost(post.id)

            const enriched = {
                ...data.post,

                tags: Array.isArray(data.post.tags)
                    ? data.post.tags
                    : (data.post.tags
                        ? data.post.tags.split(',').map(t => t.trim())
                        : []),

                images: Array.isArray(data.post.images)
                    ? data.post.images
                    : (post.image ? [{ image_url: post.image }] : []),

                comments: data.post.comments || 0,
            }

            onViewPost?.(enriched)
        } catch (err) {
            console.error('Erro ao carregar post do feed:', err)
            onViewPost?.(post)
        }
    }, [onViewPost])

    /* ── Swipe callbacks ── */
    const handleFavorite = (post) => {
        console.log('Favorited:', post.title)
    }

    const handleSkip = (post, remaining) => {
        console.log('Skipped:', post.title)

        if (hasMoreFeed && remaining <= 3) {
            loadFeed()
        }
    }

    return (
        <div className="main-feed" ref={feedRef}>
            <div className="main-feed__container main-feed__container--swipe">
                <div className="main-feed__header">
                    <h2>Community Feed</h2>
                    <p>Discover the latest posts shared by the WildLog community.</p>
                </div>

                {initialLoading ? (
                    <WildLogSpinner
                        size={72}
                        message="Loading feed"
                        overlay={false}
                        className="wl-spinner--feed"
                    />
                ) : feedPosts.length === 0 ? (
                    <div className="main-sidebar__empty">
                        <Search size={32} />
                        <p>No posts found</p>
                    </div>
                ) : (
                    <SwipeDeck
                        posts={feedPosts}
                        onViewPost={handleViewPost}
                        onFavorite={handleFavorite}
                        onSkip={handleSkip}
                    />
                )}
            </div>
        </div>
    )
}

export default FeedView