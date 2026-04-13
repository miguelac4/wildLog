import {
    Search,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Eye,
    Lock,
    Heart,
    MessageCircle,
} from 'lucide-react'
import useLenisContainer from '../../hooks/useLenisContainer.js'
import WildLogSpinner from '../WildLogSpinner'

function ExploreSidebar({
                            sidebarOpen,
                            setSidebarOpen,
                            filteredPosts,
                            selectedPost,
                            onPostClick,
                            regions,
                            loading,
                        }) {

    const { wrapperRef: sidebarListRef } = useLenisContainer({
        lerp: 0.09,
        duration: 1.2,
        wheelMultiplier: 0.7,
    })

    return (
        <aside className={`main-sidebar ${sidebarOpen ? 'main-sidebar--open' : 'main-sidebar--closed'}`}>
            <button
                className="main-sidebar__toggle"
                onClick={() => setSidebarOpen((prev) => !prev)}
                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
                {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>

            {sidebarOpen && (
                <div className="main-sidebar__content">
                    <div className="main-sidebar__header">
                        <h2 className="main-sidebar__title">
                            <MapPin size={18} color="#a0845f" />
                            Nearby Posts
                        </h2>
                        <span className="main-sidebar__count">{filteredPosts.length} spots</span>
                    </div>

                    <div className="main-sidebar__list" ref={sidebarListRef}>
                        {loading ? (
                            <WildLogSpinner
                                size={52}
                                message="Loading"
                                overlay={false}
                                className="wl-spinner--sidebar"
                            />
                        ) : filteredPosts.length === 0 ? (
                            <div className="main-sidebar__empty">
                                <Search size={32} />
                                <p>No posts found</p>
                            </div>
                        ) : (
                            filteredPosts.map((post) => (
                            <button
                                key={post.id}
                                className={`main-post-card ${selectedPost?.id === post.id ? 'main-post-card--active' : ''}`}
                                onClick={() => onPostClick(post)}
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
                        )))}
                    </div>

                    <div className="main-sidebar__legend">
                        <h3 className="main-sidebar__legend-title">Regions</h3>
                        {regions.map((region) => (
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
    )
}

export default ExploreSidebar