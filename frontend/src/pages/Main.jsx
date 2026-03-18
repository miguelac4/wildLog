/**
 * Main.jsx — Página principal autenticada da aplicação.
 *
 * Responsabilidades:
 * - gerir a navegação interna entre Explore e Feed
 * - manter o estado global da página (search, sidebar, selectedPost)
 * - coordenar os componentes principais da interface
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
import '../styles/Create.css'
import FeedView from '../components/FeedView'
import PostDetailPanel from '../components/PostDetailPanel'
import MainTopbar from '../components/MainTopbar'
import ExploreView from '../components/explore/ExploreView'
import CreateView from '../components/create/CreateView'
import { postExploreService } from '../api/postExploreService'

const MOBILE_BREAKPOINT = 768

const API_BASE = import.meta.env.VITE_API_BASE_URL
const BASE_URL = API_BASE.replace('/api', '')

function normalizeImageUrl(path) {
  if (!path) return ''

  // DEV → remover /backend
  if (BASE_URL.includes('localhost')) {
    path = path.replace('/backend', '')
  }

  return `${BASE_URL}${path}`
}

function Main() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  /* ── Estado ──────────────────────────────── */
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BREAKPOINT)
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > MOBILE_BREAKPOINT)
  const [selectedPost, setSelectedPost] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState('explore')

  const [feedPosts, setFeedPosts] = useState([])
  const [feedCursor, setFeedCursor] = useState(null)
  const [loadingFeed, setLoadingFeed] = useState(false)
  const [hasMoreFeed, setHasMoreFeed] = useState(true)

  /**
   * flyToTarget — coordenadas para onde o mapa deve voar.
   * Estrutura: { lat, lng, isMobile } | null
   * Sempre que muda, o ExploreMap faz flyTo para esse ponto.
   * Usa um id único para garantir reatividade mesmo ao clicar
   * duas vezes no mesmo post.
   */

  /* ── Deteção responsiva de mobile ───────── */
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT
      setIsMobile(mobile)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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

  const handleClosePost = useCallback(() => {
    setSelectedPost(null)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const loadFeed = useCallback(async () => {
    if (loadingFeed || !hasMoreFeed) return

    setLoadingFeed(true)

    try {
      const data = await postExploreService.getFeed(feedCursor)

      const normalized = data.feed.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        createdAt: p.created_at,
        author: p.author,
        image: normalizeImageUrl(p.image_url),
        tags: p.tags || [],
        likes: p.likes,
        comments: p.comments,
      }))

      setFeedPosts(prev => [...prev, ...normalized])
      setFeedCursor(data.next_cursor)

      if (!data.next_cursor) {
        setHasMoreFeed(false)
      }

    } catch (err) {
      console.error("Erro feed:", err)
    }

    setLoadingFeed(false)
  }, [feedCursor, loadingFeed, hasMoreFeed])

  useEffect(() => {
    if (activeView === 'feed' && feedPosts.length === 0) {
      loadFeed()
    }
  }, [activeView])

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
          CORPO PRINCIPAL - Explore ou Feed
          ══════════════════════════════════════ */}
      <div className="main-body">
        {activeView === 'explore' ? (
            <ExploreView
                isMobile={isMobile}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                selectedPost={selectedPost}
                setSelectedPost={setSelectedPost}
            />
        ) : activeView === 'create' ? (
            <CreateView onCreated={() => handleChangeView('explore')} />
        ) : (
            <FeedView
                posts={feedPosts}
                onViewPost={setSelectedPost}
                onLoadMore={loadFeed}
                hasMore={hasMoreFeed}
            />
        )}
      </div>

      {selectedPost && (
          <PostDetailPanel post={selectedPost} onClose={handleClosePost} />
      )}
    </div>
  )
}

export default Main



