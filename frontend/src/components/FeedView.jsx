import { useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import SwipeDeck from './feed/SwipeDeck'

/**
 * FeedView — Layout container for the Community Feed.
 *
 * Renders a header and delegates post rendering to SwipeDeck.
 * In swipe mode, Lenis is NOT used — the SwipeDeck manages
 * its own scroll/wheel navigation.
 *
 * Props:
 *   posts       — filtered array of post objects
 *   onViewPost  — callback when user opens/views a post
 */
function FeedView({ posts, onViewPost, onLoadMore, hasMore }) {
    const feedRef = useRef(null)

    const handleFavorite = (post) => {
        console.log('Favorited:', post.title)
    }

    const handleSkip = (post, remaining) => {
        console.log('Skipped:', post.title)

        // 🔥 quando estiver quase a acabar → carregar mais
        if (hasMore && remaining <= 3) {
            onLoadMore()
        }
    }

    return (
        <div className="main-feed" ref={feedRef}>
            <div className="main-feed__container main-feed__container--swipe">
                <div className="main-feed__header">
                    <h2>Community Feed</h2>
                    <p>Discover the latest posts shared by the WildLog community.</p>
                </div>

                {posts.length === 0 ? (
                    <div className="main-sidebar__empty">
                        <Search size={32} />
                        <p>No posts found</p>
                    </div>
                ) : (
                    <SwipeDeck
                        posts={posts}
                        onViewPost={onViewPost}
                        onFavorite={handleFavorite}
                        onSkip={handleSkip}
                    />
                )}
            </div>
        </div>
    )
}

export default FeedView