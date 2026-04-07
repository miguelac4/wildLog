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
import { Map, Grid } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import '../styles/Main.css'
import '../styles/Create.css'
import FeedView from '../components/FeedView'
import PostDetailPanel from '../components/PostDetailPanel'
import MainTopbar from '../components/MainTopbar'
import ExploreView from '../components/explore/ExploreView'
import CreateView from '../components/create/CreateView'
import { postExploreService } from '../api/postExploreService'
import { postUserService } from '../api/postUserService'
import AccountStats from '../components/Account/AccountStats'
import AccountPosts from '../components/Account/AccountPosts'

const MOBILE_BREAKPOINT = 768

const API_BASE = import.meta.env.VITE_API_BASE_URL
const BASE_URL = API_BASE.replace('/api', '')

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
  
  const [accountPosts, setAccountPosts] = useState([])
  const [loadingAccountPosts, setLoadingAccountPosts] = useState(false)

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

  const handlePostClick = useCallback((post) => {
    setSelectedPost(post)
  }, [])

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
        image: `${BASE_URL}${p.image_url}`,
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
    
    if (activeView === 'account' && accountPosts.length === 0 && !loadingAccountPosts) {
      setLoadingAccountPosts(true)
      postUserService.getUserPosts()
        .then(res => {
          if (res && res.posts) {
            setAccountPosts(res.posts)
          }
        })
        .catch(err => console.error("Erro account posts:", err))
        .finally(() => setLoadingAccountPosts(false))
    }
  }, [activeView])

  const publicPostCount = accountPosts.filter(p => p.visibility === 'public').length;

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
        {activeView === 'explore' && (
          <ExploreView
            isMobile={isMobile}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            selectedPost={selectedPost}
            setSelectedPost={setSelectedPost}
          />
        )}
        
        {activeView === 'create' && (
          <CreateView onCreated={() => handleChangeView('explore')} />
        )}
        
        {activeView === 'feed' && (
          <FeedView
            posts={feedPosts}
            onViewPost={setSelectedPost}
            onLoadMore={loadFeed}
            hasMore={hasMoreFeed}
          />
        )}

        {/* ── VISTA: ACCOUNT (Perfil com as tuas 3 classes) ── */}


        {activeView === 'account' && (
          <div className="account-page-wrapper" data-lenis-prevent>
            <div className="account-page-inner">
              {/* 1. Classe das Estatísticas e Bio no topo */}
              <div className="account-stats-container">
                <AccountStats user={user} publicPostCount={publicPostCount} />
              </div>

              <div className="account-content-box is-posts">
                <AccountPosts posts={accountPosts} onPostClick={handlePostClick} />
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



