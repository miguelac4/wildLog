/**
 * Home.jsx — Página inicial (Landing Page)
 *
 * Estrutura de secções (scrollable):
 *   1. Hero    — vídeo fullscreen + logo + tagline + CTA
 *   2. About   — descrição da plataforma + feature cards
 *   3. Contact — formulário de contacto
 *
 * A transição Hero → About usa um efeito de blur + fade
 * na parte inferior do hero (.hero-blur-fade).
 *
 * O PillNav no topo faz scroll suave para cada secção via useRef.
 *
 * Ficheiros relacionados:
 *   - styles/Home.css         → Estilos visuais
 *   - config/mediaConfig.js   → URLs dos assets
 *   - components/PillNav.jsx  → Navegação pill
 */
import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MEDIA_URLS } from '../config/mediaConfig'
import PillNav from '../components/PillNav'
import { MapPin, Binoculars, Aperture, Handshake, HandHeart, Leaf} from 'lucide-react'
import '../styles/Home.css'

function Home() {
  const navigate = useNavigate()

  /* Índice da secção actualmente visível — controla o PillNav */
  const [activeSection, setActiveSection] = useState(0)

  /* Controla visibilidade do botão fixo "Log in" no canto superior direito */
  const [showFixedLogin, setShowFixedLogin] = useState(false)

  /* Refs para cada secção */
  const heroRef      = useRef(null)
  const aboutRef     = useRef(null)
  const contactRef   = useRef(null)
  const heroLoginRef = useRef(null)

  /**
   * IntersectionObserver — deteta qual secção ocupa a maior parte do viewport.
   * threshold: 0.4 → a secção precisa de estar 40% visível para ser considerada ativa.
   * rootMargin: '-10% 0px -50% 0px' → zona de deteção no terço superior do ecrã.
   */
  useEffect(() => {
    const sections = [
      { ref: heroRef,    index: 0 },
      { ref: aboutRef,   index: 1 },
      { ref: contactRef, index: 2 },
    ]

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const match = sections.find((s) => s.ref.current === entry.target)
            if (match) setActiveSection(match.index)
          }
        })
      },
      {
        root: null,
        rootMargin: '-40% 0px -40% 0px', // Activa quando a secção cruza o centro
        threshold: 0,
      }
    )

    sections.forEach(({ ref }) => {
      if (ref.current) observer.observe(ref.current)
    })

    return () => observer.disconnect()
  }, [])

  /**
   * Observer do botão hero-login:
   * Quando sai completamente do viewport → mostra o fixo no canto direito.
   * Quando reaparece → esconde o fixo.
   */
  useEffect(() => {
    const el = heroLoginRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFixedLogin(!entry.isIntersecting)
      },
      { root: null, threshold: 0 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])


  /** Scroll para a secção — o Lenis intercepta automaticamente */
  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const navItems = [
    { label: 'Home',    onClick: () => scrollTo(heroRef)    },
    { label: 'About',   onClick: () => scrollTo(aboutRef)   },
    { label: 'Contact', onClick: () => scrollTo(contactRef) },
  ]

  return (
    <div className="home-page">

      {/* ── PILL NAV (fixo no topo) ────────────────────── */}
      <div className="pill-nav-wrapper">
        <PillNav items={navItems} activeIndex={activeSection} />
      </div>

      {/* ── FIXED LOGIN (aparece quando hero-login sai do viewport) ── */}
      <button
        className={`fixed-login ${showFixedLogin ? 'fixed-login--visible' : ''}`}
        onClick={() => navigate('/login')}
      >
        Log in
        <svg className="fixed-login__icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <line x1="32" y1="5" x2="72" y2="88" />
          <line x1="68" y1="5" x2="28" y2="88" />
          <path d="M14 88 Q12 92 16 92 L84 92 Q88 92 86 88 L52 28 Q50 24 48 28 Z" />
        </svg>
      </button>

      {/* ══════════════════════════════════════════════════
          SECÇÃO 1 — HERO
          ══════════════════════════════════════════════════ */}
      <section className="hero" ref={heroRef}>
        <video
          className="hero__video"
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          preload="auto"
          poster=""
        >
          <source src={MEDIA_URLS.banner} type="video/mp4" />
        </video>

        {/* Overlay escuro */}
        <div className="hero__overlay" />

        {/* Blur + fade na base do hero → transição para o About */}
        <div className="hero__blur-fade" />

        {/* Conteúdo centrado */}
        <div className="hero__content">
          <div className="logo-section">
            <img src={MEDIA_URLS.logo} alt="WildLog Logo" className="logo-image" />
            <h1 className="logo-text">WildLog</h1>
            <p className="tagline">Connect with Nature</p>
          </div>

          <div className="description">
            <p>Welcome to WildLog, the social network for nature and wildlife lovers!</p>
            <p>Share experiences, discover new places, and connect with enthusiasts around the world.</p>
          </div>

          <button ref={heroLoginRef} className="hero-login" onClick={() => navigate('/login')}>
            Log in
            <svg className="hero-login__icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <line x1="32" y1="5" x2="72" y2="88" />
              <line x1="68" y1="5" x2="28" y2="88" />
              <path d="M14 88 Q12 92 16 92 L84 92 Q88 92 86 88 L52 28 Q50 24 48 28 Z" />
            </svg>
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECÇÃO 2 — ABOUT
          ══════════════════════════════════════════════════ */}
      <section className="about" ref={aboutRef}>
        <div className="section-inner">
          <h2 className="section-title">What is WildLog?</h2>
          <p className="section-text">
            WildLog is a social platform for people who prefer trees over traffic.
          </p>
          <p className="section-text">
            Discover natural spots, share your finds, and explore the outdoors with
            a community that respects nature.
          </p>

          {/* Carrossel infinito — cards deslizam suavemente para a esquerda */}
          <div className="about__carousel">
            <div className="about__track">
              {/* Conjunto original */}
              <div className="about-card"> <Binoculars color="#9B805D" strokeWidth={1.75} size={40} />
                <h3>Discover Places</h3>
                <p>Find hidden natural spots shared by the community and explore nature responsibly.</p>
              </div>
              <div className="about-card"> <Aperture color="#9B805D" strokeWidth={1.75} size={40} />
                <h3>Share Your Journey</h3>
                <p>Post photos, locations and experiences from your adventures in the wild.</p>
              </div>
              <div className="about-card"> <Handshake color="#9B805D" strokeWidth={1.75} size={40} />
                <h3>Nature Community</h3>
                <p>Connect with campers and explorers who share the same passion for nature.</p>
              </div>
              <div className="about-card"> <Leaf color="#9B805D" strokeWidth={1.75} size={40} />
                <h3>Respect Nature</h3>
                <p>Promote responsible exploration and help protect the places we love.</p>
              </div>
              <div className="about-card"> <MapPin color="#9B805D" strokeWidth={1.75} size={40} />
                <h3>Learn & Inspire</h3>
                <p>Discover new locations and inspire others to explore nature consciously.</p>
              </div>
              <div className="about-card"> <HandHeart color="#9B805D" strokeWidth={1.75} size={40} />
                <h3>Explore Responsibly</h3>
                <p>Share and discover natural spaces while encouraging ethical outdoor practices.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECÇÃO 3 — CONTACT
          ══════════════════════════════════════════════════ */}
      <section className="contact" ref={contactRef}>
        <div className="section-inner contact-inner">
          <h2 className="section-title">Get in Touch</h2>
          <p className="section-text">
            Have a question, suggestion, or just want to say hello?
            We'd love to hear from you.
          </p>

          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="contact-form__row">
              <input type="text"  placeholder="Your name"  className="contact-input" />
              <input type="email" placeholder="Your email" className="contact-input" />
            </div>
            <textarea
              placeholder="Your message..."
              className="contact-input contact-textarea"
              rows={5}
            />
            <button type="submit" className="contact-btn">Send Message →</button>
          </form>

          <p className="contact-email">
            Or reach us at{' '}
            <a href="mailto:hello@wild-log.com" className="contact-link">hello@wild-log.com</a>
          </p>
        </div>
      </section>

    </div>
  )
}

export default Home