import { Search } from 'lucide-react'
import useLenisContainer from '../hooks/useLenisContainer'
import SwipeDeck from './feed/SwipeDeck'

/**
 * FeedView — Layout container for the Community Feed.
 *
 * Renders a header and delegates post rendering to SwipeDeck.
 *
 * Props:
 *   posts       — filtered array of post objects
 *   onViewPost  — callback when user opens/views a post
 */
function FeedView({ posts, onViewPost }) {
    const feedRef = useLenisContainer()

    const handleFavorite = (post) => {
        // TODO: integrate with API — POST /api/posts/:id/favorite
        console.log('Favorited:', post.title)
    }

    const handleSkip = (post) => {
        // TODO: optional analytics or dismiss logic
        console.log('Skipped:', post.title)
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