import { useState, useRef, useCallback, useEffect } from 'react'
import { Star, X } from 'lucide-react'
import PostCard from './PostCard'
import SwipeControls from './SwipeControls'

/**
 * SwipeDeck — Manages the stacked card deck and swipe gestures.
 *
 * Props:
 *   posts           — array of post objects
 *   onViewPost      — callback when user opens a post
 *   onFavorite      — callback when user favorites a post (swipe right)
 *   onSkip          — callback when user skips a post (swipe left)
 */

const SWIPE_THRESHOLD = 100
const SWIPE_VELOCITY = 0.4
const MAX_VISIBLE = 3
const FLY_OUT_DURATION = 350

function SwipeDeck({ posts, onViewPost, onFavorite, onSkip }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [dragState, setDragState] = useState({ x: 0, y: 0, dragging: false })
    const [flyAway, setFlyAway] = useState(null)
    const startRef = useRef({ x: 0, y: 0, time: 0 })
    const draggingRef = useRef(false)

    // Reset index if posts change
    useEffect(() => {
        setCurrentIndex(0)
    }, [posts])

    const activePost = posts[currentIndex] ?? null
    const isEmpty = currentIndex >= posts.length

    /* ── Advance to next card ─────────── */
    const advanceCard = useCallback((direction) => {
        setFlyAway({ direction })
        setTimeout(() => {
            setFlyAway(null)
            setDragState({ x: 0, y: 0, dragging: false })
            draggingRef.current = false
            setCurrentIndex((prev) => prev + 1)

            if (direction === 'right' && activePost) {
                onFavorite?.(activePost)
            } else if (direction === 'left' && activePost) {
                onSkip?.(activePost)
            }
        }, FLY_OUT_DURATION)
    }, [activePost, onFavorite, onSkip])

    /* ── Pointer handlers (attached to top card wrapper) ── */
    const handlePointerDown = useCallback((e) => {
        if (flyAway) return
        // Ignore if clicking on a button
        if (e.target.closest('button')) return

        startRef.current = { x: e.clientX, y: e.clientY, time: Date.now() }
        setDragState({ x: 0, y: 0, dragging: true })
        draggingRef.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
    }, [flyAway])

    const handlePointerMove = useCallback((e) => {
        if (!draggingRef.current || flyAway) return
        const dx = e.clientX - startRef.current.x
        const dy = e.clientY - startRef.current.y
        setDragState({ x: dx, y: dy, dragging: true })
    }, [flyAway])

    const handlePointerUp = useCallback((e) => {
        if (!draggingRef.current || flyAway) return
        draggingRef.current = false

        const dx = e.clientX - startRef.current.x
        const dt = Date.now() - startRef.current.time
        const velocity = Math.abs(dx) / Math.max(dt, 1)

        if (Math.abs(dx) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY) {
            advanceCard(dx > 0 ? 'right' : 'left')
        } else {
            setDragState({ x: 0, y: 0, dragging: false })
        }
    }, [flyAway, advanceCard])

    /* ── Button handlers ────────────── */
    const handleSkipBtn = useCallback(() => {
        if (isEmpty || flyAway) return
        advanceCard('left')
    }, [isEmpty, flyAway, advanceCard])

    const handleFavoriteBtn = useCallback(() => {
        if (isEmpty || flyAway) return
        advanceCard('right')
    }, [isEmpty, flyAway, advanceCard])

    const handleCommentBtn = useCallback(() => {
        if (activePost) onViewPost?.(activePost)
    }, [activePost, onViewPost])

    const handleOpenPost = useCallback((post) => {
        onViewPost?.(post)
    }, [onViewPost])

    const handleFavoritePost = useCallback(() => {
        if (!flyAway) advanceCard('right')
    }, [flyAway, advanceCard])

    /* ── Restart deck ────────────────── */
    const handleRestart = useCallback(() => {
        setCurrentIndex(0)
        setDragState({ x: 0, y: 0, dragging: false })
        draggingRef.current = false
        setFlyAway(null)
    }, [])

    /* ── Render ──────────────────────── */
    const visiblePosts = posts.slice(currentIndex, currentIndex + MAX_VISIBLE)
    // Compute hint opacity based on drag
    const hintProgress = Math.min(Math.abs(dragState.x) / SWIPE_THRESHOLD, 1)

    // Compute indicator opacity: 0 when idle, ramps up with drag distance
    const skipOpacity  = dragState.x < 0 ? hintProgress : 0
    const favOpacity   = dragState.x > 0 ? hintProgress : 0

    return (
        <div className="swipe-deck">

            {/* ── Screen-edge swipe indicators ── */}
            <div className="swipe-deck__indicators" aria-hidden="true">
                {/* Left edge — Skip */}
                <div
                    className="swipe-indicator swipe-indicator--left"
                    style={{ opacity: skipOpacity }}
                >
                    <div className="swipe-indicator__glow" />
                    <div className="swipe-indicator__label">
                        <X size={30} />
                        <span>Skip</span>
                    </div>
                </div>

                {/* Right edge — Favorite */}
                <div
                    className="swipe-indicator swipe-indicator--right"
                    style={{ opacity: favOpacity }}
                >
                    <div className="swipe-indicator__glow" />
                    <div className="swipe-indicator__label">
                        <Star size={30} />
                        <span>Favorite</span>
                    </div>
                </div>
            </div>

            <div className="swipe-deck__stack">
                {isEmpty ? (
                    <div className="swipe-deck__done">
                        <p>You've seen all posts!</p>
                        <button
                            type="button"
                            className="swipe-deck__restart-btn"
                            onClick={handleRestart}
                        >
                            Start over
                        </button>
                    </div>
                ) : (
                    visiblePosts.map((post, i) => {
                        const isTop = i === 0
                        const stackOffset = i * 6
                        const stackScale = 1 - i * 0.035

                        let transform
                        let transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease'

                        if (isTop && flyAway) {
                            const flyX = flyAway.direction === 'right' ? 800 : -800
                            transform = `translate(${flyX}px, -80px) rotate(${flyAway.direction === 'right' ? 25 : -25}deg)`
                            transition = `transform ${FLY_OUT_DURATION}ms cubic-bezier(0.2, 0, 0.6, 1)`
                        } else if (isTop && dragState.dragging) {
                            const rotation = dragState.x * 0.06
                            transform = `translate(${dragState.x}px, ${dragState.y * 0.3}px) rotate(${rotation}deg)`
                            transition = 'none'
                        } else {
                            transform = `translateY(${stackOffset}px) scale(${stackScale})`
                        }

                        // Hint overlays opacity (only for top card while dragging)
                        const hintStyle = isTop ? {
                            '--hint-like-opacity': dragState.x > 0 ? hintProgress : 0,
                            '--hint-skip-opacity': dragState.x < 0 ? hintProgress : 0,
                        } : {}

                        /* Pointer events only on the top card wrapper */
                        const pointerHandlers = isTop && !flyAway ? {
                            onPointerDown: handlePointerDown,
                            onPointerMove: handlePointerMove,
                            onPointerUp: handlePointerUp,
                            onPointerCancel: handlePointerUp,
                        } : {}

                        return (
                            <div
                                key={post.id}
                                className="swipe-deck__card-wrapper"
                                style={{
                                    transform,
                                    transition,
                                    zIndex: MAX_VISIBLE - i,
                                    opacity: i >= MAX_VISIBLE - 1 ? 0.5 : 1,
                                    pointerEvents: isTop && !flyAway ? 'auto' : 'none',
                                    touchAction: 'none',
                                    ...hintStyle,
                                }}
                                {...pointerHandlers}
                            >
                                <PostCard
                                    post={post}
                                    isActive={isTop}
                                    onOpen={handleOpenPost}
                                    onFavorite={handleFavoritePost}
                                />
                            </div>
                        )
                    })
                )}
            </div>

            {/* Card counter */}
            {!isEmpty && (
                <div className="swipe-deck__counter">
                    {currentIndex + 1} / {posts.length}
                </div>
            )}

            <SwipeControls
                onSkip={handleSkipBtn}
                onFavorite={handleFavoriteBtn}
                onComment={handleCommentBtn}
                disabled={isEmpty}
            />
        </div>
    )
}

export default SwipeDeck
