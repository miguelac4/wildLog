/**
 * SpotlightCard.jsx — Card com efeito de spotlight que segue o rato
 *
 * Inspirado no ReactBits SpotlightCard.
 * Quando o utilizador passa o rato sobre o card, um gradiente radial
 * acompanha a posição do cursor, criando um efeito de "lanterna".
 *
 * Props:
 *   - children {ReactNode}      → Conteúdo dentro do card
 *   - className {string}        → Classes CSS adicionais (default: '')
 *   - spotlightColor {string}   → Cor do spotlight em rgba (default: verde WildLog)
 *
 * Conceitos React demonstrados:
 *   - useRef() para aceder ao DOM e definir CSS custom properties
 *   - CSS custom properties (--mouse-x, --mouse-y) controladas via JS
 *   - Pseudo-element ::before controlado por variáveis CSS
 *
 * Ficheiros relacionados:
 *   - components/SpotlightCard.css → Estilos do efeito spotlight
 */
import { useRef } from 'react'
import '../styles/SpotlightCard.css'

const SpotlightCard = ({
  children,
  className = '',
  spotlightColor = 'rgba(76, 175, 80, 0.2)',
}) => {
  const divRef = useRef(null)

  /**
   * Ao mover o rato, calcula a posição relativa dentro do card
   * e atualiza as CSS custom properties para o gradiente seguir o cursor.
   */
  const handleMouseMove = (e) => {
    const rect = divRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    divRef.current.style.setProperty('--mouse-x', `${x}px`)
    divRef.current.style.setProperty('--mouse-y', `${y}px`)
    divRef.current.style.setProperty('--spotlight-color', spotlightColor)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`card-spotlight ${className}`}
    >
      {children}
    </div>
  )
}

export default SpotlightCard

