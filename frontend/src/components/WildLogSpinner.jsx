import { MEDIA_URLS } from '../config/mediaConfig'

/**
 * WildLogSpinner — Reusable branded loading indicator.
 *
 * Renders a golden spinning ring around the WildLog logo
 * on a translucent dark backdrop. Matches the intro animation style.
 *
 * Props:
 *   size      — diameter in px (default 80)
 *   message   — optional text below the spinner
 *   overlay   — if true, covers the parent with position:absolute (default true)
 *   className — extra CSS class for the wrapper
 */
export default function WildLogSpinner({
  size = 80,
  message,
  overlay = true,
  className = '',
}) {
  const logoSize = size * 0.52
  const ringSize = size
  const ringStroke = Math.max(1.5, size * 0.02)

  return (
    <div
      className={`wl-spinner ${overlay ? 'wl-spinner--overlay' : ''} ${className}`}
    >
      <div className="wl-spinner__core" style={{ width: size, height: size }}>
        {/* Ambient glow */}
        <div
          className="wl-spinner__glow"
          style={{ width: size * 1.5, height: size * 1.5 }}
        />

        {/* Spinning ring */}
        <svg
          className="wl-spinner__ring"
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringSize / 2 - ringStroke}
            fill="none"
            stroke="rgba(155, 128, 93, 0.12)"
            strokeWidth={ringStroke}
          />
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringSize / 2 - ringStroke}
            fill="none"
            stroke="rgba(160, 132, 95, 0.65)"
            strokeWidth={ringStroke}
            strokeDasharray={`${ringSize * 0.7} ${ringSize * 2.5}`}
            strokeLinecap="round"
          />
        </svg>

        {/* Logo */}
        <img
          className="wl-spinner__logo"
          src={MEDIA_URLS.logo}
          alt=""
          style={{ width: logoSize, height: logoSize }}
        />
      </div>

      {message && <p className="wl-spinner__message">{message}</p>}
    </div>
  )
}

