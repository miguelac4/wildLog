/**
 * useLenis.js — Hook para Lenis smooth scrolling (rubber band)
 *
 * Inicializa o Lenis globalmente com interpolação suave.
 * O efeito "rubber band" vem da combinação de:
 *   - lerp baixo (0.07) → scroll demora a "parar", desliza
 *   - duration alto (1.6) → animação mais longa
 *   - easing exponencial → desaceleração natural
 *
 * Documentação: https://github.com/darkroomengineering/lenis
 */
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export default function useLenis() {
  const lenisRef = useRef(null)

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.07,             // Interpolação linear — mais baixo = mais "elástico"
      duration: 1.6,          // Duração da suavização
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.8,   // Reduz velocidade da roda → mais controlo
      touchMultiplier: 1.5,
      infinite: false,
    })

    lenisRef.current = lenis

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  return lenisRef
}
