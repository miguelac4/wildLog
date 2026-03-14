import { motion } from 'framer-motion'
import { MEDIA_URLS } from '../../config/mediaConfig'

/**
 * LogoAnimation — Animated logo that constructs itself with a glow effect.
 * WildLog dark-nature theme with earthy golden accents.
 *
 * Can be used standalone wherever a logo reveal is needed.
 * Duration: ~1.5 seconds
 */
export default function LogoAnimation() {
  return (
    <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-8">
      {/* Ambient glow behind logo — earthy gold */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(155,128,93,0.18) 0%, rgba(139,115,85,0.08) 40%, transparent 70%)',
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.8, 0.6], scale: [0.5, 1.2, 1] }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />






       

      {/* The actual logo image — fades in after stroke animation */}
      <motion.img
        src={MEDIA_URLS.logo}
        alt="WildLog Logo"
        className="absolute inset-0 w-full h-full object-contain p-4"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(155, 128, 93, 0.25))',
        }}
        initial={{
          opacity: 0,
          scale: 0.7,
          filter: 'brightness(1.5) blur(4px) drop-shadow(0 0 20px rgba(155,128,93,0.25))',
        }}
        animate={{
          opacity: 1,
          scale: 1,
          filter: 'brightness(1) blur(0px) drop-shadow(0 0 20px rgba(155,128,93,0.25))',
        }}
        transition={{
          duration: 0.8,
          delay: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      />

      {/* Final soft pulse glow — earthy gold */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(155, 128, 93, 0.08) 0%, transparent 60%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0.3, 0.5, 0.3] }}
        transition={{ duration: 4, delay: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
