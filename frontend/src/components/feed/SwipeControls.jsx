import { X, Star, MessageCircle } from 'lucide-react'

/**
 * SwipeControls — Circular action buttons below the swipe deck.
 *
 * Props:
 *   onSkip      — trigger left swipe (skip)
 *   onFavorite  — trigger right swipe (favorite)
 *   onComment   — open comments
 *   disabled    — disable buttons (e.g., when deck is empty)
 */
function SwipeControls({ onSkip, onFavorite, onComment, disabled }) {
    return (
        <div className="swipe-controls">
            <button
                type="button"
                className="swipe-controls__btn swipe-controls__btn--skip"
                onClick={onSkip}
                disabled={disabled}
                title="Skip"
            >
                <X size={22} />
            </button>

            <button
                type="button"
                className="swipe-controls__btn swipe-controls__btn--comment"
                onClick={onComment}
                disabled={disabled}
                title="Comment"
            >
                <MessageCircle size={22} />
            </button>

            <button
                type="button"
                className="swipe-controls__btn swipe-controls__btn--favorite"
                onClick={onFavorite}
                disabled={disabled}
                title="Favorite"
            >
                <Star size={22} />
            </button>
        </div>
    )
}

export default SwipeControls

