import { motion } from 'framer-motion'
import { MEDIA_URLS } from '../../config/mediaConfig'

/**
 * IntroLogo — Fullscreen cinematic intro overlay for WildLog.
 *
 * Dark green nature-inspired background with golden/earthy accents.
 * The logo appears to "construct" itself from blur + glow + scale.
 *
 * Timeline (~2.8s total):
 *  0.0s  — dark green bg visible, ambient golden glow begins
 *  0.2s  — outer ring stroke traces in
 *  0.4s  — inner organic ring pulses
 *  0.6s  — logo image fades in from blur + slight zoom
 *  1.4s  — logo settles at full clarity
 *  1.6s  — "WildLog" text fades in below
 *  2.0s  — logo slides up slightly, text fades
 *  2.4s  — overlay fades out
 *  2.8s  — onComplete fires
 *
 * Props:
 *   onComplete — called when the full animation finishes
 *
 * Usage:
 *   <IntroLogo onComplete={() => setShowIntro(false)} />
 */
export default function IntroLogo({ onComplete }) {
  return (
    <motion.div
      key="intro-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1b4332 0%, #0d2818 50%, #051f15 100%)',
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Subtle radial gradient overlay for depth */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(155, 128, 93, 0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating decorative orb — top right */}
      <motion.div
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          top: -80,
          right: -80,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(139, 115, 85, 0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating decorative orb — bottom left */}
      <motion.div
        style={{
          position: 'absolute',
          width: 280,
          height: 280,
          bottom: -60,
          left: -60,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(76, 175, 80, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Centered logo container ── */}
      <motion.div
        style={{ position: 'relative', width: 240, height: 240 }}
        animate={{ y: [0, 0, -30] }}
        transition={{
          duration: 2.8,
          times: [0, 0.72, 1],
          ease: 'easeInOut',
        }}
        onAnimationComplete={() => onComplete?.()}
      >
        {/* Golden ambient glow behind logo */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(155, 128, 93, 0.25) 0%, rgba(139, 115, 85, 0.10) 40%, transparent 70%)',
          }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0.7], scale: [0.4, 1.3, 1.05] }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
        />

        {/* Logo image — fades in from blur + slight zoom */}
        <motion.img
          src={MEDIA_URLS.logo}
          alt="WildLog"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: 20,
            filter: 'drop-shadow(0 0 24px rgba(155, 128, 93, 0.35))',
          }}
          initial={{
            opacity: 0,
            scale: 0.65,
            filter: 'brightness(1.4) blur(6px) drop-shadow(0 0 24px rgba(155,128,93,0.35))',
          }}
          animate={{
            opacity: 1,
            scale: 1,
            filter: 'brightness(1) blur(0px) drop-shadow(0 0 24px rgba(155,128,93,0.35))',
          }}
          transition={{
            duration: 0.9,
            delay: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />

        {/* Soft lingering glow after logo settles */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(155, 128, 93, 0.10) 0%, transparent 60%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.35] }}
          transition={{ duration: 1.6, delay: 1.2, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* "WildLog" text — fades in then out */}
      <motion.p
        style={{
          position: 'absolute',
          bottom: '36%',
          color: 'rgba(200, 169, 126, 0.8)',
          fontSize: '0.875rem',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          fontWeight: 500,
          margin: 0,
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 0.85, 0.85, 0], y: [10, 0, 0, -8] }}
        transition={{
          duration: 2.8,
          times: [0, 0.35, 0.7, 1],
          ease: 'easeInOut',
        }}
      >
        WildLog
      </motion.p>
    </motion.div>
  )
}
