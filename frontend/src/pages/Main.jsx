/**
 * Main.jsx — Página principal autenticada da aplicação.
 *
 * Responsabilidades:
 * - gerir a navegação interna entre Explore e Feed
 * - manter o estado global da página (search, sidebar, selectedPost)
 * - coordenar os componentes principais da interface
 *
 * Dados:
 * - usa dados mockados (posts e regiões) até existir integração real com a API
 *
 * Componentes relacionados:
 * - MainTopbar
 * - ExploreSidebar
 * - ExploreMap
 * - FeedView
 * - PostDetailPanel
 */
import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../styles/Main.css'
import FeedView from '../components/FeedView'
import PostDetailPanel from '../components/PostDetailPanel'
import MainTopbar from '../components/MainTopbar'
import ExploreSidebar from '../components/ExploreSidebar'
import ExploreMap from '../components/ExploreMap'
// imports para oa ccount
import AccountStats from "../components/Account/AccountStats.jsx"
import AccountPosts from "../components/Account/AccountPosts.jsx";
import AccountMap from "../components/Account/AccountMap.jsx";

const MOBILE_BREAKPOINT = 768

/* ══════════════════════════════════════════
   DADOS MOCKADOS
   Substituir por chamadas API reais:
     - GET /api/posts       → posts com coordenadas
     - GET /api/regions     → regiões bloqueadas/desbloqueadas
   ══════════════════════════════════════════ */
const MOCK_POSTS = [
  {
    id: 1,
    title: 'Camping Ferreira do Zêzere',
    author: 'catemadonatureza',
    avatar: null,
    images: [
      '/wildlog/media/post/ferreira_1.jpeg',
      '/wildlog/media/post/ferreira_2.jpeg',
      '/wildlog/media/post/ferreira_3.jpeg'
    ],
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
    title: 'Hidden Waterfall in Bergen',
    author: 'belamarela',
    avatar: null,
    images: [
      '/wildlog/media/post/norway_1.jpeg',
      '/wildlog/media/post/norway_2.jpeg',
      '/wildlog/media/post/norway_3.jpeg',
      '/wildlog/media/post/norway_4.jpeg'
    ],
    description: 'Found this hidden gem after a 3-hour hike through dense forest. Worth every step.',
    lat: 41.7215,
    lng: -8.1528,
    likes: 256,
    comments: 45,
    tags: ['waterfall', 'hiking', 'norway'],
    createdAt: '2026-03-01',
  },
  {
    id: 3,
    title: 'Cave Surfing in Ericeira',
    author: 'miguelac4',
    avatar: null,
    images: [
      '/wildlog/media/post/ericeira_1.jpeg',
      '/wildlog/media/post/ericeira_2.jpeg'
    ],
    description: 'Afternoon birdwatching session. Spotted big waves and rare migratory species.',
    lat: 37.0194,
    lng: -7.8322,
    likes: 89,
    comments: 12,
    tags: ['birds', 'waves', 'ericeira'],
    createdAt: '2026-03-05',
  },
  {
    id: 4,
    title: 'Camping in Montains of Romania',
    author: 'astrocamper',
    avatar: null,
    images: [
      '/wildlog/media/post/romenia_1.jpeg',
      '/wildlog/media/post/romenia_2.jpeg',
      '/wildlog/media/post/romenia_3.jpeg'
    ],
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
    images: [
      '/wildlog/media/post/ferreira_1.jpeg',
      '/wildlog/media/post/ferreira_2.jpeg',
      '/wildlog/media/post/ferreira_3.jpeg'
    ],
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

function Main() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  /* ── Estado ──────────────────────────────── */
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BREAKPOINT)
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > MOBILE_BREAKPOINT)
  const [selectedPost, setSelectedPost] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState('explore')

  /**
   * flyToTarget — coordenadas para onde o mapa deve voar.
   * Estrutura: { lat, lng, isMobile } | null
   * Sempre que muda, o ExploreMap faz flyTo para esse ponto.
   * Usa um id único para garantir reatividade mesmo ao clicar
   * duas vezes no mesmo post.
   */
  const [flyToTarget, setFlyToTarget] = useState(null)

  /* ── Deteção responsiva de mobile ───────── */
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT
      setIsMobile(mobile)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
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
  const handleChangeView = (view) => {
    setSelectedPost(null)
    setActiveView(view)
  }

  /**
   * handlePostClick — handler unificado para clique em pin ou post da sidebar.
   *
   * 1. Define o post selecionado
   * 2. Dispara flyTo no mapa (com nível de zoom adequado a desktop/mobile)
   * 3. No mobile, fecha a sidebar para revelar o mapa
   */
  const handlePostClick = useCallback((post) => {
    setSelectedPost(post)

    setFlyToTarget({
      lat: post.lat,
      lng: post.lng,
      isMobile,
      _id: Date.now(), // garante reatividade ao re-clicar no mesmo post
    })

    // Mobile: fechar sidebar para dar foco ao mapa + painel
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [isMobile])

  const handleFlyComplete = useCallback(() => {
    setFlyToTarget(null)
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
          TOPBAR
          ══════════════════════════════════════ */}
      <MainTopbar
          activeView={activeView}
          onChangeView={handleChangeView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          user={user}
          onLogout={handleLogout}
      />

      {/* ══════════════════════════════════════
          CORPO PRINCIPAL - Explore, Feed ou Account
          ══════════════════════════════════════ */}
      <div className="main-body">

        {/* ── VISTA: EXPLORE (Mapa + Sidebar) ── */}
        {activeView === 'explore' && (
            <>
              <ExploreSidebar
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                  filteredPosts={filteredPosts}
                  selectedPost={selectedPost}
                  onPostClick={handlePostClick}
                  regions={MOCK_LOCKED_REGIONS}
              />
              <ExploreMap
                  posts={MOCK_POSTS}
                  regions={MOCK_LOCKED_REGIONS}
                  onPostClick={handlePostClick}
                  activeView={activeView}
                  flyToTarget={flyToTarget}
                  onFlyComplete={handleFlyComplete}
              />
            </>
        )}

        {/* ── VISTA: FEED (Swipe Deck) ── */}
        {activeView === 'feed' && (
            <FeedView posts={filteredPosts} onViewPost={setSelectedPost} />
        )}

        {/* ── VISTA: ACCOUNT (Perfil com as tuas 3 classes) ── */}
        {activeView === 'account' && (
            <div className="account-page-wrapper">

              {/* 1. Classe das Estatísticas e Bio no topo */}
              <div className="account-stats-container">
                <AccountStats user={user} />
              </div>

              {/* 2. Classes de Posts e Mapa lado a lado */}
              <div className="account-split-view">
                <div className="account-content-box">
                  <AccountPosts />
                </div>
                <div className="account-content-box" style={{ padding: 0 }}>
                  <AccountMap />
                </div>
              </div>

            </div>
        )}
      </div>

      {/* Painel de detalhe que abre ao clicar num post (funciona em todas as vistas) */}
      {selectedPost && (
          <PostDetailPanel post={selectedPost} onClose={handleClosePost} />
      )}
    </div>
  )
}

export default Main



