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
import { Grid3X3, Settings } from 'lucide-react'
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
import AccountSettings from '../components/Account/AccountSettings'
import { postBookmarkService } from '../api/postBookmarkService'
import { normalizeImageUrl } from '../config/mediaConfig'

const MOBILE_BREAKPOINT = 768


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

  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [accountTab, setAccountTab] = useState('posts') // 'posts' | 'settings'

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

  // Load Bookmarks globalmente uma vez
  useEffect(() => {
    if (user) {
      postBookmarkService.getBookmarks()
        .then(data => {
            if (data && data.bookmarks) {
                setBookmarkedIds(new Set(data.bookmarks.map(b => String(b.post_id))))
            }
        })
        .catch(err => console.error("Erro fetch bookmarks", err))
    }
  }, [user])

  const handleToggleBookmark = useCallback((postId, isSaved) => {
      setBookmarkedIds(prev => {
          const next = new Set(prev)
          if (isSaved) next.add(String(postId))
          else next.delete(String(postId))
          return next
      })
  }, [])

  const publicPostCount = accountPosts.filter(p => p.visibility === 'public' || !p.visibility).length;
  const privatePostCount = accountPosts.filter(p => p.visibility === 'private').length;

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
            bookmarkedIds={bookmarkedIds}
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
              {/* Profile header */}
              <AccountStats
                user={user}
                publicPostCount={publicPostCount}
                privatePostCount={privatePostCount}
              />

              {/* Sub-navigation: Posts / Settings */}
              <div className="account-view-tabs">
                <button
                  className={`account-view-tab ${accountTab === 'posts' ? 'account-view-tab--active' : ''}`}
                  onClick={() => setAccountTab('posts')}
                >
                  <Grid3X3 size={15} /> Posts
                </button>
                <button
                  className={`account-view-tab ${accountTab === 'settings' ? 'account-view-tab--active' : ''}`}
                  onClick={() => setAccountTab('settings')}
                >
                  <Settings size={15} /> Settings
                </button>
              </div>

              {/* Tab content */}
              {accountTab === 'posts' && (
                <div className="account-content-box is-posts">
                  <AccountPosts
                    posts={accountPosts}
                    bookmarkedIds={bookmarkedIds}
                    onPostClick={handlePostClick}
                    loading={loadingAccountPosts}
                  />
                </div>
              )}

              {accountTab === 'settings' && (
                <div className="account-content-box is-settings">
                  <AccountSettings />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Painel de detalhe que abre ao clicar num post (funciona em todas as vistas) */}
      {selectedPost && (
          <PostDetailPanel 
              post={selectedPost} 
              onClose={handleClosePost} 
              isBookmarked={bookmarkedIds.has(String(selectedPost.id))}
              onToggleBookmark={handleToggleBookmark}
          />
      )}
    </div>
  )
}

export default Main



