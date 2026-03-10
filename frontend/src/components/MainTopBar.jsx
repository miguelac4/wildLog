import { Search, LogOut, Compass, User } from 'lucide-react'
import { MEDIA_URLS } from '../config/mediaConfig'

function MainTopbar({
                        activeView,
                        onChangeView,
                        searchQuery,
                        setSearchQuery,
                        user,
                        onLogout,
                    }) {
    return (
        <header className="main-topbar">
            <div className="main-topbar__left">
                <img
                    src={MEDIA_URLS.logo}
                    alt="WildLog"
                    className="main-topbar__logo"
                />

                <span className="main-topbar__brand">WildLog</span>
                <span className="main-topbar__separator" />

                <button
                    className={`main-topbar__nav-btn ${activeView === 'explore' ? 'main-topbar__nav-btn--active' : ''}`}
                    onClick={() => onChangeView('explore')}
                    type="button"
                >
                    <Compass size={14} />
                    Explore
                </button>

                <button
                    className={`main-topbar__nav-btn ${activeView === 'feed' ? 'main-topbar__nav-btn--active' : ''}`}
                    onClick={() => onChangeView('feed')}
                    type="button"
                >
                    <Compass size={14} />
                    Feed
                </button>
            </div>

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

            <div className="main-topbar__right">
                <div className="main-topbar__user">
                    <div className="main-topbar__avatar">
                        <User size={16} />
                    </div>
                    <span className="main-topbar__username">{user?.username || 'Explorer'}</span>
                </div>

                <button className="main-topbar__action" onClick={onLogout} title="Log out">
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    )
}

export default MainTopbar