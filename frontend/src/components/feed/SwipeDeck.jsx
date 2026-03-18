import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Star, X, ChevronUp, ChevronDown } from 'lucide-react'
import PostCard from './PostCard'
import SwipeControls from './SwipeControls'

/**
 * SwipeDeck — Manages the stacked card deck with swipe gestures
 *             AND vertical scroll/wheel navigation (prev / next).
 *
 * Two distinct gesture axes:
 *   • Horizontal drag → Tinder-style swipe (favorite / skip)
 *   • Vertical scroll / wheel → browse posts without action
 *
 * Props:
 *   posts           — array of post objects
 *   onViewPost      — callback when user opens a post
 *   onFavorite      — callback when user favorites a post (swipe right)
 *   onSkip          — callback when user skips a post (swipe left)
 */

const SWIPE_THRESHOLD     = 120   // px — minimum drag distance to trigger swipe
const SWIPE_VELOCITY      = 0.5   // px/ms — velocity shortcut
const MIN_DRAG_DISTANCE   = 12    // px — ignore micro-movements (fixes desktop auto-skip)
const MAX_VISIBLE         = 3
const FLY_OUT_DURATION    = 350
const SCROLL_COOLDOWN     = 400   // ms — debounce between scroll navigations

function SwipeDeck({ posts, onViewPost, onFavorite, onSkip }) {
    const [currentIndex, setCurrentIndex]   = useState(0)
    const [dragState, setDragState]         = useState({ x: 0, y: 0, dragging: false })
    const [flyAway, setFlyAway]             = useState(null)
    /* Direction the scroll-transition animates: 'up' (next) or 'down' (prev) */
    const [scrollDir, setScrollDir]         = useState(null)

    const startRef      = useRef({ x: 0, y: 0, time: 0 })
    const draggingRef   = useRef(false)
    const [dragIntent, setDragIntent] = useState(null)  // 'horizontal' | 'vertical' | null
    const dragIntentRef = useRef(null)  // mirror for sync access in handlers
    const scrollTimer   = useRef(null)
    const deckRef       = useRef(null)

    // Reset index only when the actual post list changes (not just reference)
    const postsKey = useMemo(() => posts.map(p => p.id).join(','), [posts])
    useEffect(() => { setCurrentIndex(0) }, [postsKey])

    const activePost = posts[currentIndex] ?? null
    const isEmpty    = currentIndex >= posts.length

    /* ── Advance card (swipe action) ──────── */
    const advanceCard = useCallback((direction) => {
        setFlyAway({ direction })
        setTimeout(() => {
            setFlyAway(null)
            setDragState({ x: 0, y: 0, dragging: false })
            draggingRef.current = false
            dragIntentRef.current = null
            setDragIntent(null)
            setCurrentIndex((prev) => Math.min(prev + 1, posts.length))

            const remaining = posts.length - currentIndex - 1

            if (direction === 'right' && activePost) {
                onFavorite?.(activePost)
            } else if (direction === 'left' && activePost) {
                onSkip?.(activePost, remaining)
            }

        }, FLY_OUT_DURATION)
    }, [activePost, onFavorite, onSkip, posts.length])

    /* ── Scroll navigation (no action, just browse) ── */
    const goToNext = useCallback(() => {
        if (currentIndex >= posts.length - 1 || flyAway || scrollDir) return

        const remaining = posts.length - currentIndex - 1

        if (remaining <= 3) {
            onSkip?.(posts[currentIndex], remaining)
        }

        setScrollDir('up')
        setTimeout(() => {
            setCurrentIndex((prev) => prev + 1)
            setScrollDir(null)
        }, 280)
    }, [currentIndex, posts, flyAway, scrollDir, onSkip])

    const goToPrev = useCallback(() => {
        if (currentIndex <= 0 || flyAway || scrollDir) return
        setScrollDir('down')
        setTimeout(() => {
            setCurrentIndex((prev) => prev - 1)
            setScrollDir(null)
        }, 280)
    }, [currentIndex, flyAway, scrollDir])

    /* ── Wheel handler — vertical scroll navigates ── */
    useEffect(() => {
        const deck = deckRef.current
        if (!deck) return

        const onWheel = (e) => {
            e.preventDefault()
            if (draggingRef.current || flyAway) return

            // Debounce fast scroll
            if (scrollTimer.current) return
            scrollTimer.current = setTimeout(() => { scrollTimer.current = null }, SCROLL_COOLDOWN)

            if (e.deltaY > 0) goToNext()
            else if (e.deltaY < 0) goToPrev()
        }

        deck.addEventListener('wheel', onWheel, { passive: false })
        return () => deck.removeEventListener('wheel', onWheel)
    }, [goToNext, goToPrev, flyAway])

    /* ── Keyboard nav (arrow up/down) ── */
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'ArrowDown')  { e.preventDefault(); goToNext() }
            if (e.key === 'ArrowUp')    { e.preventDefault(); goToPrev() }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [goToNext, goToPrev])

    /* ── Pointer handlers (horizontal swipe) ── */
    const handlePointerDown = useCallback((e) => {
        if (flyAway || scrollDir) return
        if (e.target.closest('button')) return

        startRef.current  = { x: e.clientX, y: e.clientY, time: Date.now() }
        dragIntentRef.current = null
        setDragIntent(null)
        draggingRef.current = true
        setDragState({ x: 0, y: 0, dragging: true })
        e.currentTarget.setPointerCapture(e.pointerId)
    }, [flyAway, scrollDir])

    const handlePointerMove = useCallback((e) => {
        if (!draggingRef.current || flyAway) return

        const dx = e.clientX - startRef.current.x
        const dy = e.clientY - startRef.current.y
        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)

        /* Determine intent on first significant movement */
        if (!dragIntentRef.current && (absDx > MIN_DRAG_DISTANCE || absDy > MIN_DRAG_DISTANCE)) {
            const intent = absDx >= absDy ? 'horizontal' : 'vertical'
            dragIntentRef.current = intent
            setDragIntent(intent)
        }

        if (dragIntentRef.current === 'horizontal') {
            setDragState({ x: dx, y: dy, dragging: true })
        }
        /* vertical drag is ignored — wheel / buttons handle scroll */
    }, [flyAway])

    const handlePointerUp = useCallback((e) => {
        if (!draggingRef.current || flyAway) return
        draggingRef.current = false

        const dx = e.clientX - startRef.current.x
        const dy = e.clientY - startRef.current.y
        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)
        const dt = Date.now() - startRef.current.time
        const velocity = absDx / Math.max(dt, 1)

        /* Only trigger swipe if intent was horizontal AND exceeded threshold */
        if (
            dragIntentRef.current === 'horizontal' &&
            absDx > MIN_DRAG_DISTANCE &&
            (absDx > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY)
        ) {
            advanceCard(dx > 0 ? 'right' : 'left')
        } else if (
            dragIntentRef.current === 'vertical' &&
            absDy > 40
        ) {
            /* Vertical drag → navigate */
            if (dy < 0) goToNext()
            else goToPrev()
            setDragState({ x: 0, y: 0, dragging: false })
        } else {
            /* No significant drag — treat as tap → open post */
            setDragState({ x: 0, y: 0, dragging: false })
            if (absDx < MIN_DRAG_DISTANCE && absDy < MIN_DRAG_DISTANCE && activePost) {
                onViewPost?.(activePost)
            }
        }

        dragIntentRef.current = null
        setDragIntent(null)
    }, [flyAway, advanceCard, goToNext, goToPrev, activePost, onViewPost])

    /* ── Button handlers ──────────── */
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

    /* ── Restart deck ──────────────── */
    const handleRestart = useCallback(() => {
        setCurrentIndex(0)
        setDragState({ x: 0, y: 0, dragging: false })
        draggingRef.current = false
        dragIntentRef.current = null
        setDragIntent(null)
        setFlyAway(null)
        setScrollDir(null)
    }, [])

    /* ── Render ────────────────────── */
    const visiblePosts = posts.slice(currentIndex, currentIndex + MAX_VISIBLE)
    const hintProgress = Math.min(Math.abs(dragState.x) / SWIPE_THRESHOLD, 1)
    const skipOpacity  = dragState.x < 0 ? hintProgress : 0
    const favOpacity   = dragState.x > 0 ? hintProgress : 0

    return (
        <div className="swipe-deck" ref={deckRef}>

            {/* ── Screen-edge swipe indicators ── */}
            <div className="swipe-deck__indicators" aria-hidden="true">
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
                <div
                    className="swipe-indicator swipe-indicator--right"
                    style={{ opacity: favOpacity }}
                >
                    <div className="swipe-indicator__glow" />
                    <div className="swipe-indicator__label">
                        <Star size={30} />
                        <span>Want To Visit</span>
                    </div>
                </div>
            </div>

            {/* ── Card counter ── */}
            {!isEmpty && (
                <div className="swipe-deck__counter">
                    {currentIndex + 1} / {posts.length}
                </div>
            )}


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
                        const isTop       = i === 0
                        const stackOffset = i * 6
                        const stackScale  = 1 - i * 0.035

                        let transform
                        let transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease'

                        if (isTop && flyAway) {
                            const flyX = flyAway.direction === 'right' ? 800 : -800
                            transform  = `translate(${flyX}px, -80px) rotate(${flyAway.direction === 'right' ? 25 : -25}deg)`
                            transition = `transform ${FLY_OUT_DURATION}ms cubic-bezier(0.2, 0, 0.6, 1)`
                        } else if (isTop && scrollDir) {
                            /* Scroll transition — card slides up or down */
                            const yOff = scrollDir === 'up' ? -40 : 40
                            transform  = `translateY(${yOff}px) scale(0.96)`
                            transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease'
                        } else if (isTop && dragState.dragging && dragIntent === 'horizontal') {
                            const rotation = dragState.x * 0.06
                            transform  = `translate(${dragState.x}px, ${dragState.y * 0.3}px) rotate(${rotation}deg)`
                            transition = 'none'
                        } else {
                            transform = `translateY(${stackOffset}px) scale(${stackScale})`
                        }

                        const hintStyle = isTop ? {
                            '--hint-like-opacity': dragState.x > 0 ? hintProgress : 0,
                            '--hint-skip-opacity': dragState.x < 0 ? hintProgress : 0,
                        } : {}

                        const pointerHandlers = isTop && !flyAway && !scrollDir ? {
                            onPointerDown:   handlePointerDown,
                            onPointerMove:   handlePointerMove,
                            onPointerUp:     handlePointerUp,
                            onPointerCancel: handlePointerUp,
                        } : {}

                        return (
                            <div
                                key={`${post.id}-${currentIndex}`}
                                className={`swipe-deck__card-wrapper ${isTop && scrollDir ? 'swipe-deck__card-wrapper--scrolling' : ''}`}
                                style={{
                                    transform,
                                    transition,
                                    zIndex: MAX_VISIBLE - i,
                                    opacity: isTop && scrollDir ? 0.4 : (i >= MAX_VISIBLE - 1 ? 0.5 : 1),
                                    pointerEvents: isTop && !flyAway && !scrollDir ? 'auto' : 'none',
                                    touchAction: 'none',
                                    ...hintStyle,
                                }}
                                {...pointerHandlers}
                            >
                                <PostCard
                                    post={post}
                                    isActive={isTop}
                                />
                            </div>
                        )
                    })
                )}
            </div>

            {/* ── Scroll navigation (both always visible, greyed at boundaries) ── */}
            {!isEmpty && (
                <div className="swipe-deck__nav-row">
                    <button
                        type="button"
                        className="swipe-deck__scroll-btn swipe-deck__scroll-btn--up"
                        onClick={goToPrev}
                        disabled={currentIndex <= 0}
                        aria-label="Previous post"
                    >
                        <ChevronUp size={18} />
                    </button>
                    <button
                        type="button"
                        className="swipe-deck__scroll-btn swipe-deck__scroll-btn--down"
                        onClick={goToNext}
                        disabled={currentIndex >= posts.length - 1}
                        aria-label="Next post"
                    >
                        <ChevronDown size={18} />
                    </button>
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
