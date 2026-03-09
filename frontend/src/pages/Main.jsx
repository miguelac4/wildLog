/**
 * Main.jsx — Página principal da aplicação (Globo Interativo)
 *
 * Estrutura:
 *   ┌───────────────────────────────────────────────────────┐
 *   │ .main-page (fullscreen, fundo escuro)                 │
 *   │   ├── .main-topbar (header com logo + nav + avatar)   │
 *   │   ├── .main-globe (container CesiumJS — protagonista) │
 *   │   │     ├── CesiumViewer (globo 3D interativo)        │
 *   │   │     ├── .globe-overlay-gradient (vinheta suave)   │
 *   │   │     └── .globe-coords (coordenadas do cursor)     │
 *   │   ├── .main-sidebar (painel lateral discreto)         │
 *   │   │     ├── search / filtros                          │
 *   │   │     └── lista de posts próximos                   │
 *   │   └── .main-post-panel (overlay ao clicar num pin)    │
 *   └───────────────────────────────────────────────────────┘
 *
 * Integração CesiumJS:
 *   Usa a biblioteca "cesium" com integração directa no DOM.
 *   Plugin "vite-plugin-cesium" serve os assets estáticos.
 *
 * Dados:
 *   Atualmente usa dados mockados (MOCK_POSTS, MOCK_LOCKED_REGIONS).
 *   Substituir pelas chamadas API reais quando disponível.
 *
 * Ficheiros relacionados:
 *   - styles/Main.css         → Estilos visuais
 *   - config/mediaConfig.js   → URLs dos assets
 *   - hooks/useAuth.jsx       → Dados do utilizador autenticado
 *   - context/AuthContext.jsx  → Provider de autenticação
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  Search,
  MapPin,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Compass,
  Eye,
  Lock,
  X,
  User,
  Camera,
  Heart,
  MessageCircle,
} from 'lucide-react'
import '../styles/Main.css'

/* ══════════════════════════════════════════
   DADOS MOCKADOS
   Substituir por chamadas API reais:
     - GET /api/posts       → posts com coordenadas
     - GET /api/regions     → regiões bloqueadas/desbloqueadas
   ══════════════════════════════════════════ */
const MOCK_POSTS = [
  {
    id: 1,
    title: 'Sunset at Serra da Estrela',
    author: 'naturelover42',
    avatar: null,
    image: null,
    description: 'The most beautiful sunset I have ever witnessed. The golden light hitting the granite peaks was magical.',
    lat: 40.3215,
    lng: -7.6128,
    likes: 128,
    comments: 23,
    tags: ['mountain', 'sunset', 'portugal'],
    createdAt: '2026-02-15',
  },
  {
    id: 2,
    title: 'Hidden Waterfall in Gerês',
    author: 'wildexplorer',
    avatar: null,
    image: null,
    description: 'Found this hidden gem after a 3-hour hike through dense forest. Worth every step.',
    lat: 41.7215,
    lng: -8.1528,
    likes: 256,
    comments: 45,
    tags: ['waterfall', 'hiking', 'gerês'],
    createdAt: '2026-03-01',
  },
  {
    id: 3,
    title: 'Dawn at Ria Formosa',
    author: 'birdwatcher_pt',
    avatar: null,
    image: null,
    description: 'Early morning birdwatching session. Spotted flamingos and rare migratory species.',
    lat: 37.0194,
    lng: -7.8322,
    likes: 89,
    comments: 12,
    tags: ['birds', 'wetlands', 'algarve'],
    createdAt: '2026-03-05',
  },
  {
    id: 4,
    title: 'Camping under the Milky Way',
    author: 'astrocamper',
    avatar: null,
    image: null,
    description: 'Dark sky reserve in Alentejo. Zero light pollution and a crystal clear night.',
    lat: 38.5630,
    lng: -7.9135,
    likes: 342,
    comments: 67,
    tags: ['camping', 'stars', 'alentejo'],
    createdAt: '2026-01-20',
  },
  {
    id: 5,
    title: 'Cliffs of Sagres',
    author: 'coastal_hiker',
    avatar: null,
    image: null,
    description: 'Standing at the edge of Europe. The raw power of the Atlantic crashing below.',
    lat: 37.0079,
    lng: -8.9463,
    likes: 198,
    comments: 31,
    tags: ['cliffs', 'ocean', 'sagres'],
    createdAt: '2026-02-28',
  },
]

/**
 * Regiões bloqueadas — áreas que o utilizador ainda não desbloqueou.
 * Cada região é um retângulo (bounding box) com coordenadas [west, south, east, north].
 *
 * TODO: Substituir por GET /api/regions?userId=...
 */
const MOCK_LOCKED_REGIONS = [
  { id: 'r1', name: 'Peneda-Gerês Reserve', bounds: [-8.3, 41.6, -7.9, 41.9], locked: true },
  { id: 'r2', name: 'Arrábida Coast',       bounds: [-9.1, 38.4, -8.8, 38.6], locked: true },
  { id: 'r3', name: 'Sintra Forest',        bounds: [-9.5, 38.7, -9.3, 38.85], locked: false },
]

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ══════════════════════════════════════════ */
function Main() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  /* ── Estado ──────────────────────────────── */
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedPost, setSelectedPost] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [globeReady, setGlobeReady] = useState(false)

  /* Ref para o container do Cesium Viewer */
  const cesiumContainerRef = useRef(null)
  const viewerRef = useRef(null)
  const coordsRef = useRef(null)        // DOM ref para o elemento de coordenadas
  const cursorCoordsRef = useRef(null)   // dados lat/lng actuais (sem re-render)

  /**
   * ── Inicialização do CesiumJS ─────────────────────────────
   *
   * O Cesium Viewer é criado dentro do useEffect para garantir
   * que o DOM está pronto. O cleanup destrói o viewer ao desmontar.
   *
   * Para ativar o Cesium:
   *   1. npm install cesium resium vite-plugin-cesium
   *   2. Adicionar o plugin ao vite.config.js:
   *        import cesium from 'vite-plugin-cesium'
   *        plugins: [react(), cesium()]
   *   3. Obter um token em https://ion.cesium.com/tokens
   *   4. Descomentar o bloco abaixo
   */
  useEffect(() => {
    setGlobeReady(false)
    const container = cesiumContainerRef.current
    if (!container) return

    let destroyed = false

    import('cesium').then((Cesium) => {
      // Se o componente já foi desmontado enquanto o import carregava, não criar viewer
      if (destroyed) return

      // Token de acesso ao Cesium Ion (obter em cesium.com)
      Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN

      const viewer = new Cesium.Viewer(container, {
        // ── Configuração visual limpa ──
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        vrButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        scene3DOnly: true,
        skyBox: false,
        skyAtmosphere: new Cesium.SkyAtmosphere(),
        contextOptions: {
          webgl: { alpha: true },
        },
      })

      // Fundo transparente (integra-se com o fundo escuro da página)
      viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a1f14')

      // ── Adicionar pins dos posts ──────────────────────
      MOCK_POSTS.forEach((post) => {
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(post.lng, post.lat),
          billboard: {
            image: Cesium.buildModuleUrl('Assets/Textures/maki/marker.png'),
            width: 32,
            height: 32,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            color: Cesium.Color.fromCssColorString('#a0845f'),
          },
          properties: {
            postId: post.id,
          },
        })
      })

      // ── Regiões bloqueadas (overlay dourado translúcido) ──
      MOCK_LOCKED_REGIONS.forEach((region) => {
        if (region.locked) {
          viewer.entities.add({
            rectangle: {
              coordinates: Cesium.Rectangle.fromDegrees(...region.bounds),
              material: Cesium.Color.fromCssColorString('#a0845f').withAlpha(0.15),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString('#8b7355').withAlpha(0.4),
              outlineWidth: 2,
            },
          })
        }
      })

      // ── Click handler para pins ──────────────────────
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction((movement) => {
        const picked = viewer.scene.pick(movement.position)
        if (Cesium.defined(picked) && picked.id?.properties?.postId) {
          const postId = picked.id.properties.postId.getValue()
          const post = MOCK_POSTS.find((p) => p.id === postId)
          if (post) setSelectedPost(post)
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      // ── Mouse move → coordenadas (DOM directo, sem re-render) ──
      handler.setInputAction((movement) => {
        const cartesian = viewer.camera.pickEllipsoid(
          movement.endPosition,
          viewer.scene.globe.ellipsoid
        )
        const el = coordsRef.current
        if (cartesian) {
          const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
          const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4)
          const lng = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4)
          cursorCoordsRef.current = { lat, lng }
          if (el) {
            el.style.display = ''
            el.querySelector('[data-lat]').textContent = `${lat}° N`
            el.querySelector('[data-lng]').textContent = `${lng}° W`
          }
        } else {
          cursorCoordsRef.current = null
          if (el) el.style.display = 'none'
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      // Câmara inicial — vista sobre Portugal
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-8.0, 39.5, 2000000),
        duration: 0,
      })

      viewerRef.current = viewer
      setGlobeReady(true)
    })

    return () => {
      destroyed = true
      setGlobeReady(false)
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy()
      }
      viewerRef.current = null
    }
  }, [])

  /* ── Filtro de pesquisa ──────────────────── */
  const filteredPosts = MOCK_POSTS.filter((post) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      post.title.toLowerCase().includes(q) ||
      post.author.toLowerCase().includes(q) ||
      post.tags.some((tag) => tag.includes(q))
    )
  })

  /* ── Handlers ────────────────────────────── */
  const handlePostClick = useCallback((post) => {
    setSelectedPost(post)

    /*
    // ── Fly to do Cesium (descomentar quando ativo) ──
    if (viewerRef.current) {
      const Cesium = window.Cesium
      viewerRef.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(post.lng, post.lat, 50000),
        duration: 1.5,
      })
    }
    */
  }, [])

  const handleClosePost = useCallback(() => {
    setSelectedPost(null)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="main-page">

      {/* ══════════════════════════════════════
          TOPBAR — header com branding + ações
          ══════════════════════════════════════ */}
      <header className="main-topbar">
        {/* Lado esquerdo: brand */}
        <div className="main-topbar__left">
          <span className="main-topbar__brand">WildLog</span>
          <span className="main-topbar__separator" />
          <span className="main-topbar__subtitle">
            <Compass size={14} />
            Explore
          </span>
        </div>

        {/* Centro: search compacto */}
        <div className="main-topbar__center">
          <div className="main-search main-search--topbar">
            <Search size={15} className="main-search__icon" />
            <input
              type="text"
              placeholder="Search places, people, tags…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="main-search__input"
            />
          </div>
        </div>

        {/* Lado direito: user + logout */}
        <div className="main-topbar__right">
          <div className="main-topbar__user">
            <div className="main-topbar__avatar">
              <User size={16} />
            </div>
            <span className="main-topbar__username">{user?.username || 'Explorer'}</span>
          </div>
          <button className="main-topbar__action" onClick={handleLogout} title="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════
          CORPO PRINCIPAL — globo + sidebar
          ══════════════════════════════════════ */}
      <div className="main-body">

        {/* ── SIDEBAR ──────────────────────── */}
        <aside className={`main-sidebar ${sidebarOpen ? 'main-sidebar--open' : 'main-sidebar--closed'}`}>
          {/* Toggle */}
          <button
            className="main-sidebar__toggle"
            onClick={() => setSidebarOpen((prev) => !prev)}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          {sidebarOpen && (
            <div className="main-sidebar__content">
              {/* Header da sidebar */}
              <div className="main-sidebar__header">
                <h2 className="main-sidebar__title">
                  <MapPin size={18} color="#a0845f" />
                  Nearby Posts
                </h2>
                <span className="main-sidebar__count">{filteredPosts.length} spots</span>
              </div>

              {/* Lista de posts */}
              <div className="main-sidebar__list">
                {filteredPosts.map((post) => (
                  <button
                    key={post.id}
                    className={`main-post-card ${selectedPost?.id === post.id ? 'main-post-card--active' : ''}`}
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="main-post-card__header">
                      <span className="main-post-card__author">@{post.author}</span>
                      <span className="main-post-card__date">{post.createdAt}</span>
                    </div>
                    <h3 className="main-post-card__title">{post.title}</h3>
                    <div className="main-post-card__tags">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="main-post-card__tag">#{tag}</span>
                      ))}
                    </div>
                    <div className="main-post-card__stats">
                      <span><Heart size={12} /> {post.likes}</span>
                      <span><MessageCircle size={12} /> {post.comments}</span>
                    </div>
                  </button>
                ))}

                {filteredPosts.length === 0 && (
                  <div className="main-sidebar__empty">
                    <Search size={32} />
                    <p>No posts found</p>
                  </div>
                )}
              </div>

              {/* Legenda das regiões */}
              <div className="main-sidebar__legend">
                <h3 className="main-sidebar__legend-title">Regions</h3>
                {MOCK_LOCKED_REGIONS.map((region) => (
                  <div key={region.id} className="main-legend-item">
                    {region.locked ? (
                      <Lock size={14} className="main-legend-item__icon main-legend-item__icon--locked" />
                    ) : (
                      <Eye size={14} className="main-legend-item__icon main-legend-item__icon--unlocked" />
                    )}
                    <span className={`main-legend-item__name ${region.locked ? 'main-legend-item__name--locked' : ''}`}>
                      {region.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── GLOBO (protagonista visual) ── */}
        <div className="main-globe">
          {/* Container do CesiumJS Viewer */}
          <div ref={cesiumContainerRef} className="main-globe__viewer">
            {/* Placeholder visual enquanto o Cesium não está ativo */}
            {!globeReady && (
              <div className="main-globe__placeholder">
                <div className="main-globe__planet" />
                <div className="main-globe__glow" />
                <p className="main-globe__hint">
                  <Compass size={20} />
                  Globe loading…
                </p>

                {/* Mock pins sobre o placeholder */}
                {MOCK_POSTS.map((post) => (
                  <button
                    key={post.id}
                    className="main-globe__mock-pin"
                    style={{
                      /* Projeção simplificada lat/lng → % do container */
                      left: `${((post.lng + 10) / 4) * 100}%`,
                      top: `${((42 - post.lat) / 8) * 100}%`,
                    }}
                    onClick={() => handlePostClick(post)}
                    title={post.title}
                  >
                    <MapPin size={20} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vinheta escura nas bordas (profundidade cinematográfica) */}
          <div className="main-globe__vignette" />

          {/* Coordenadas do cursor (actualizado via DOM directo, sem re-render) */}
          <div ref={coordsRef} className="main-globe__coords" style={{ display: 'none' }}>
            <span data-lat />
            <span data-lng />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          POST DETAIL PANEL — overlay ao clicar num pin
          ══════════════════════════════════════ */}
      {selectedPost && (
        <div className="main-post-panel">
          <div className="main-post-panel__backdrop" onClick={handleClosePost} />
          <div className="main-post-panel__card">
            <button className="main-post-panel__close" onClick={handleClosePost}>
              <X size={20} />
            </button>

            {/* Imagem do post (placeholder se não existir) */}
            <div className="main-post-panel__image">
              {selectedPost.image ? (
                <img src={selectedPost.image} alt={selectedPost.title} />
              ) : (
                <div className="main-post-panel__image-placeholder">
                  <Camera size={40} />
                </div>
              )}
            </div>

            {/* Conteúdo */}
            <div className="main-post-panel__body">
              <div className="main-post-panel__meta">
                <span className="main-post-panel__author">@{selectedPost.author}</span>
                <span className="main-post-panel__date">{selectedPost.createdAt}</span>
              </div>

              <h2 className="main-post-panel__title">{selectedPost.title}</h2>
              <p className="main-post-panel__desc">{selectedPost.description}</p>

              <div className="main-post-panel__tags">
                {selectedPost.tags.map((tag) => (
                  <span key={tag} className="main-post-panel__tag">#{tag}</span>
                ))}
              </div>

              <div className="main-post-panel__stats">
                <span className="main-post-panel__stat">
                  <Heart size={16} /> {selectedPost.likes} likes
                </span>
                <span className="main-post-panel__stat">
                  <MessageCircle size={16} /> {selectedPost.comments} comments
                </span>
              </div>

              <div className="main-post-panel__location">
                <MapPin size={14} color="#a0845f" />
                <span>{selectedPost.lat}° N, {selectedPost.lng}° W</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Main



