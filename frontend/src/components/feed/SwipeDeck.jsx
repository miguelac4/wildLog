import { useState, useRef, useCallback, useEffect } from 'react'
import { Star, X, ChevronUp, ChevronDown } from 'lucide-react'
import PostCard from './PostCard'
import SwipeControls from './SwipeControls'

/**
 * SwipeDeck — Manages the stacked card deck with swipe gestures
 *             AND vertical scroll/wheel navigation (prev / next).
 *
 * First-time onboarding: the top card physically swipes right then left
 * with floating labels ("Bookmark" / "Skip") before the user interacts.
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

const SWIPE_THRESHOLD     = 120
const SWIPE_VELOCITY      = 0.5
const MIN_DRAG_DISTANCE   = 12
const MAX_VISIBLE         = 3
const FLY_OUT_DURATION    = 350
const SCROLL_COOLDOWN     = 400

const LS_KEY = 'wildlog_swipe_onboarding_seen'

/* ── Demo animation config ── */
const DEMO_PAUSE_BEFORE   = 600   // ms before starting
const DEMO_SWING_DURATION = 700   // ms per swing
const DEMO_HOLD_DURATION  = 600   // ms hold at peak
const DEMO_SWING_PX       = 110   // how far the card moves
const DEMO_ROTATION       = 6     // degrees at peak

function SwipeDeck({ posts, onViewPost, onFavorite, onSkip }) {
    const [currentIndex, setCurrentIndex]   = useState(0)
    const [dragState, setDragState]         = useState({ x: 0, y: 0, dragging: false })
    const [flyAway, setFlyAway]             = useState(null)
    const [scrollDir, setScrollDir]         = useState(null)

    const startRef      = useRef({ x: 0, y: 0, time: 0 })
    const draggingRef   = useRef(false)
    const [dragIntent, setDragIntent] = useState(null)
    const dragIntentRef = useRef(null)
    const scrollTimer   = useRef(null)
    const deckRef       = useRef(null)

    const activePost = posts[currentIndex] ?? null
    const isEmpty    = currentIndex >= posts.length

    /* ═══════════════════════════════════
       ONBOARDING DEMO — card auto-swipe
       ═══════════════════════════════════ */
    const [showDemo, setShowDemo] = useState(() => {
        try { return !localStorage.getItem(LS_KEY) } catch { return false }
    })
    // demo offset animated via state: { x, rotation, phase }
    // phases: 'idle' → 'swing-right' → 'hold-right' → 'return-center'
    //       → 'swing-left' → 'hold-left' → 'return-center' → 'done'
    const [demoOffset, setDemoOffset] = useState({ x: 0, rotation: 0, phase: 'idle' })
    const demoTimerRef = useRef(null)

    const finishDemo = useCallback(() => {
        clearTimeout(demoTimerRef.current)
        setShowDemo(false)
        setDemoOffset({ x: 0, rotation: 0, phase: 'done' })
        try { localStorage.setItem(LS_KEY, '1') } catch { /* */ }
    }, [])

    /* Run the demo sequence */
    useEffect(() => {
        if (!showDemo || isEmpty) return

        let cancelled = false
        const seq = async () => {
            const wait = (ms) => new Promise(r => { demoTimerRef.current = setTimeout(r, ms) })

            await wait(DEMO_PAUSE_BEFORE)
            if (cancelled) return

            // 1) Swing right
            setDemoOffset({ x: DEMO_SWING_PX, rotation: DEMO_ROTATION, phase: 'swing-right' })
            await wait(DEMO_SWING_DURATION + DEMO_HOLD_DURATION)
            if (cancelled) return

            // 2) Return to center
            setDemoOffset({ x: 0, rotation: 0, phase: 'return-center' })
            await wait(DEMO_SWING_DURATION)
            if (cancelled) return

            // 3) Swing left
            setDemoOffset({ x: -DEMO_SWING_PX, rotation: -DEMO_ROTATION, phase: 'swing-left' })
            await wait(DEMO_SWING_DURATION + DEMO_HOLD_DURATION)
            if (cancelled) return

            // 4) Return to center
            setDemoOffset({ x: 0, rotation: 0, phase: 'return-center' })
            await wait(DEMO_SWING_DURATION)
            if (cancelled) return

            // Done
            finishDemo()
        }

        seq()
        return () => { cancelled = true; clearTimeout(demoTimerRef.current) }
    }, [showDemo, isEmpty, finishDemo])

    /* ── Advance card (swipe action) ──────── */
    const advanceCard = useCallback((direction) => {
        if (showDemo) finishDemo()

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
    }, [activePost, onFavorite, onSkip, posts.length, showDemo, finishDemo])

    /* ── Scroll navigation ── */
    const goToNext = useCallback(() => {
        if (currentIndex >= posts.length - 1 || flyAway || scrollDir) return
        if (showDemo) finishDemo()

        const remaining = posts.length - currentIndex - 1
        if (remaining <= 3) onSkip?.(posts[currentIndex], remaining)

        setScrollDir('up')
        setTimeout(() => {
            setCurrentIndex((prev) => prev + 1)
            setScrollDir(null)
        }, 280)
    }, [currentIndex, posts, flyAway, scrollDir, onSkip, showDemo, finishDemo])

    const goToPrev = useCallback(() => {
        if (currentIndex <= 0 || flyAway || scrollDir) return
        if (showDemo) finishDemo()

        setScrollDir('down')
        setTimeout(() => {
            setCurrentIndex((prev) => prev - 1)
            setScrollDir(null)
        }, 280)
    }, [currentIndex, flyAway, scrollDir, showDemo, finishDemo])

    /* ── Wheel handler ── */
    useEffect(() => {
        const deck = deckRef.current
        if (!deck) return

        const onWheel = (e) => {
            e.preventDefault()
            if (draggingRef.current || flyAway) return

            if (scrollTimer.current) return
            scrollTimer.current = setTimeout(() => { scrollTimer.current = null }, SCROLL_COOLDOWN)

            if (e.deltaY > 0) goToNext()
            else if (e.deltaY < 0) goToPrev()
        }

        deck.addEventListener('wheel', onWheel, { passive: false })
        return () => deck.removeEventListener('wheel', onWheel)
    }, [goToNext, goToPrev, flyAway])

    /* ── Keyboard nav ── */
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
        if (showDemo) { finishDemo(); return }

        startRef.current  = { x: e.clientX, y: e.clientY, time: Date.now() }
        dragIntentRef.current = null
        setDragIntent(null)
        draggingRef.current = true
        setDragState({ x: 0, y: 0, dragging: true })
        e.currentTarget.setPointerCapture(e.pointerId)
    }, [flyAway, scrollDir, showDemo, finishDemo])

    const handlePointerMove = useCallback((e) => {
        if (!draggingRef.current || flyAway) return

        const dx = e.clientX - startRef.current.x
        const dy = e.clientY - startRef.current.y
        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)

        if (!dragIntentRef.current && (absDx > MIN_DRAG_DISTANCE || absDy > MIN_DRAG_DISTANCE)) {
            const intent = absDx >= absDy ? 'horizontal' : 'vertical'
            dragIntentRef.current = intent
            setDragIntent(intent)
        }

        if (dragIntentRef.current === 'horizontal') {
            setDragState({ x: dx, y: dy, dragging: true })
        }
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
            if (dy < 0) goToNext()
            else goToPrev()
            setDragState({ x: 0, y: 0, dragging: false })
        } else {
            setDragState({ x: 0, y: 0, dragging: false })
            if (absDx < MIN_DRAG_DISTANCE && absDy < MIN_DRAG_DISTANCE && activePost) {
                onViewPost?.(activePost)
            }
        }

        dragIntentRef.current = null
        setDragIntent(null)
    }, [flyAway, advanceCard, goToNext, goToPrev, activePost, onViewPost])

    /* ── Button handlers ── */
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

    /* ── Restart deck ── */
    const handleRestart = useCallback(() => {
        setCurrentIndex(0)
        setDragState({ x: 0, y: 0, dragging: false })
        draggingRef.current = false
        dragIntentRef.current = null
        setDragIntent(null)
        setFlyAway(null)
        setScrollDir(null)
    }, [])

    /* ── Render ── */
    const visiblePosts = posts.slice(currentIndex, currentIndex + MAX_VISIBLE)
    const hintProgress = Math.min(Math.abs(dragState.x) / SWIPE_THRESHOLD, 1)
    const skipOpacity  = dragState.x < 0 ? hintProgress : 0
    const favOpacity   = dragState.x > 0 ? hintProgress : 0

    /* Demo state for labels */
    const demoIsRight = demoOffset.phase === 'swing-right'
    const demoIsLeft  = demoOffset.phase === 'swing-left'

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

            {/* ── Card counter (debug only) ──
            {!isEmpty && (
                <div className="swipe-deck__counter">
                    {currentIndex + 1} / {posts.length}
                </div>
            )}
            */}

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
                            const yOff = scrollDir === 'up' ? -40 : 40
                            transform  = `translateY(${yOff}px) scale(0.96)`
                            transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease'
                        } else if (isTop && dragState.dragging && dragIntent === 'horizontal') {
                            const rotation = dragState.x * 0.06
                            transform  = `translate(${dragState.x}px, ${dragState.y * 0.3}px) rotate(${rotation}deg)`
                            transition = 'none'
                        } else if (isTop && showDemo && demoOffset.x !== 0) {
                            /* Demo animation — card physically swings */
                            transform  = `translate(${demoOffset.x}px, 0) rotate(${demoOffset.rotation}deg)`
                            transition = `transform ${DEMO_SWING_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1)`
                        } else if (isTop && showDemo && demoOffset.phase === 'return-center') {
                            transform  = `translateY(0) scale(1)`
                            transition = `transform ${DEMO_SWING_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`
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
                                key={post.id}
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

                                {/* Demo label — inside card-wrapper, bottom center */}
                                {isTop && showDemo && (
                                    <div className={`swipe-demo-label swipe-demo-label--skip ${demoIsLeft ? 'swipe-demo-label--visible' : ''}`}>
                                        <X size={15} /> Skip
                                    </div>
                                )}
                                {isTop && showDemo && (
                                    <div className={`swipe-demo-label swipe-demo-label--fav ${demoIsRight ? 'swipe-demo-label--visible' : ''}`}>
                                        <Star size={15} /> Bookmark
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}

                {/* ── Tap hint during demo (inside stack, absolute — no layout shift) ── */}
                {showDemo && !isEmpty && (
                    <p className="swipe-demo-tap">Tap card or swipe to start</p>
                )}
            </div>

            {/* ── Scroll navigation ── */}
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
