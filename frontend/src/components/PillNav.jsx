/**
 * PillNav.jsx — Componente de navegação estilo "Pill" (ReactBits inspired)
 *
 * Barra de navegação com abas em formato de pílula e indicador animado
 * que desliza suavemente entre os itens selecionados.
 *
 * Props:
 *   - items {Array<{label, onClick}>} → Lista de itens de navegação
 *   - activeIndex {number}            → Índice do item ativo (default: 0)
 *
 * Hooks usados:
 *   - useState()  → Gere o item selecionado
 *   - useRef()    → Referência para medir posição/tamanho dos botões
 *   - useEffect() → Calcula posição do indicador pill quando o ativo muda
 *
 * Conceitos React demonstrados:
 *   - useRef para aceder a DOM elements (medir offsetLeft/offsetWidth)
 *   - useEffect com dependências para recalcular layout
 *   - CSS transitions para animações fluidas
 *   - Forwarding de eventos (onClick) dos itens
 *
 * Ficheiros relacionados:
 *   - styles/PillNav.css → Estilos do componente (dark mode)
 */
import { useState, useRef, useEffect } from 'react'
import '../styles/PillNav.css'

function PillNav({ items = [], activeIndex = 0 }) {
  const [selected, setSelected] = useState(activeIndex)
  const [pillStyle, setPillStyle] = useState({})
  const [loaded, setLoaded] = useState(false)
  const navRef = useRef(null)
  const itemRefs = useRef([])

  /**
   * Sincroniza o estado interno sempre que o pai altera activeIndex.
   * Isto permite que o scroll da página atualize o indicador pill.
   */
  useEffect(() => {
    setSelected(activeIndex)
  }, [activeIndex])

  /**
   * Recalcula a posição e largura do indicador pill
   * sempre que o item selecionado muda.
   */
  useEffect(() => {
    const activeEl = itemRefs.current[selected]
    if (activeEl) {
      const { offsetLeft, offsetWidth } = activeEl
      setPillStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      })
    }
  }, [selected])

  /**
   * Animação de entrada inicial:
   * Após mount, delay breve e depois ativa a classe "loaded"
   * que faz o nav aparecer com fade + slide.
   */
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  /**
   * Handler de click num item.
   * Atualiza o estado interno e chama o onClick do item (se existir).
   */
  const handleClick = (index) => {
    setSelected(index)
    if (items[index]?.onClick) {
      items[index].onClick()
    }
  }

  return (
    <nav
      ref={navRef}
      className={`pill-nav ${loaded ? 'pill-nav--loaded' : ''}`}
    >
      {/* Indicador pill animado (posição absoluta, segue o item ativo) */}
      <div className="pill-nav__indicator" style={pillStyle} />

      {/* Itens de navegação */}
      {items.map((item, index) => (
        <button
          key={index}
          ref={(el) => (itemRefs.current[index] = el)}
          className={`pill-nav__item ${selected === index ? 'pill-nav__item--active' : ''}`}
          onClick={() => handleClick(index)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}

export default PillNav
