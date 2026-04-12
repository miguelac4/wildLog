import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MEDIA_URLS } from '../../config/mediaConfig'

/**
 * IntroLogo — Fullscreen cinematic intro overlay for WildLog.
 *
 * Three-phase animation:
 *
 *   Phase 1 — "intro" (~1.4 s)
 *     Logo constructs itself from blur + glow + scale.
 *     "WildLog" text fades in and out.
 *
 *   Phase 2 — "breathing" (indefinite)
 *     Smooth continuous zoom in / zoom out on the logo.
 *     Golden spinner ring rotates around the logo.
 *     Stays here until Cesium signals readiness.
 *
 *   Phase 3 — "exiting"
 *     Final zoom pulse on the logo, then the entire overlay
 *     slides UP to reveal the fully-loaded application.
 *
 * Props:
 *   appReady   — boolean, true when Cesium viewer is initialised & painted
 *   onComplete — called once the exit slide-up animation finishes
 */
export default function IntroLogo({ appReady, onComplete }) {
  /* ── Stable ref for the completion callback ── */
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  /* ── Phase machine: 'intro' → 'breathing' → 'exiting' ── */
  const [phase, setPhase] = useState('intro')
  const isExiting = phase === 'exiting'

  /* Intro → breathing after the initial reveal finishes */
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase(p => (p === 'intro' ? 'breathing' : p))
    }, 1400)
    return () => clearTimeout(t)
  }, [])

  /* Start exit when Cesium is ready AND the intro reveal has finished */
  useEffect(() => {
    if (appReady && phase === 'breathing') {
      setPhase('exiting')
    }
  }, [appReady, phase])

  /* Safety timeout — never stay on the intro for more than 10 s */
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase(p => (p !== 'exiting' ? 'exiting' : p))
    }, 10_000)
    return () => clearTimeout(t)
  }, [])

  /* Show the spinner from the breathing phase onward */
  const showSpinner = phase === 'breathing'

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
        background:
          'linear-gradient(135deg, #1b4332 0%, #0d2818 50%, #051f15 100%)',
        overflow: 'hidden',
      }}
      /* ── Exit: slide the entire overlay UP to reveal the app ── */
      initial={false}
      animate={isExiting ? { y: '-100%' } : { y: 0 }}
      transition={
        isExiting
          ? { duration: 0.6, ease: [0.76, 0, 0.24, 1], delay: 0.2 }
          : undefined
      }
      onAnimationComplete={() => {
        if (isExiting) onCompleteRef.current?.()
      }}
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

      {/* ── Centered logo container — breathing + exit pulse ── */}
      <motion.div
        style={{ position: 'relative', width: 240, height: 240 }}
        animate={
          isExiting
            ? { scale: 1.12 }
            : phase === 'breathing'
              ? { scale: [1, 1.06, 1] }
              : { scale: 1 }
        }
        transition={
          isExiting
            ? { duration: 0.2, ease: 'easeOut' }
            : phase === 'breathing'
              ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.4 }
        }
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
          transition={{ duration: 1.0, ease: 'easeOut' }}
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
            filter:
              'brightness(1.4) blur(6px) drop-shadow(0 0 24px rgba(155,128,93,0.35))',
          }}
          animate={{
            opacity: 1,
            scale: 1,
            filter:
              'brightness(1) blur(0px) drop-shadow(0 0 24px rgba(155,128,93,0.35))',
          }}
          transition={{
            duration: 0.7,
            delay: 0.25,
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
          transition={{ duration: 1.0, delay: 0.6, ease: 'easeInOut' }}
        />

        {/* ── Spinning loading ring — visible during breathing ── */}
        {showSpinner && (
          <motion.svg
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 230,
              height: 230,
              marginTop: -115,
              marginLeft: -115,
              pointerEvents: 'none',
            }}
            viewBox="0 0 230 230"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{
              opacity: { duration: 0.4, ease: 'easeIn' },
              rotate: { duration: 1.4, repeat: Infinity, ease: 'linear' },
            }}
          >
            <circle
              cx="115"
              cy="115"
              r="110"
              fill="none"
              stroke="rgba(155, 128, 93, 0.35)"
              strokeWidth="1.5"
              strokeDasharray="100 592"
              strokeLinecap="round"
            />
          </motion.svg>
        )}
      </motion.div>

      {/* "WildLog" text — fades in then out during intro phase */}
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
          duration: 1.4,
          times: [0, 0.3, 0.6, 1],
          ease: 'easeInOut',
        }}
      >
        WildLog
      </motion.p>
    </motion.div>
  )
}
