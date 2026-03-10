import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export default function useLenisContainer(options = {}) {
    const wrapperRef = useRef(null)
    const lenisRef = useRef(null)

    useEffect(() => {
        const wrapper = wrapperRef.current
        if (!wrapper) return

        const lenis = new Lenis({
            wrapper,
            content: wrapper,
            lerp: 0.07,
            duration: 1.6,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 0.8,
            touchMultiplier: 1.5,
            infinite: false,
            ...options,
        })

        lenisRef.current = lenis

        let rafId = null

        const raf = (time) => {
            lenis.raf(time)
            rafId = requestAnimationFrame(raf)
        }

        rafId = requestAnimationFrame(raf)

        return () => {
            if (rafId) cancelAnimationFrame(rafId)
            lenis.destroy()
        }
    }, [options])

    return wrapperRef
}