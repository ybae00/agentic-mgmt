import './Sidebar.css'
import logoIcon from '../assets/icons/logo.svg'
import sidebarFoldIcon from '../assets/icons/sidebar-fold.svg'
import searchIcon from '../assets/icons/search.svg'
import userIcon from '../assets/icons/user.svg'
import settingIcon from '../assets/icons/setting.svg'

export default function Sidebar({ sessions, onSelect, onNewSession, onSettings, collapsed, onToggleCollapse }) {
  const items = sessions.filter((s) => s.id !== 'new')

  if (collapsed) {
    return (
      <aside className="sidebar collapsed" data-onboarding="sidebar">
        <button
          className="sidebar-expand-btn"
          type="button"
          aria-label="Expand sidebar"
          onClick={() => onToggleCollapse?.()}
        >
          <img src={logoIcon} alt="Logo" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="sidebar" data-onboarding="sidebar">
      <div className="sidebar-top">
        <header className="sidebar-header">
          <div className="sidebar-header-left">
            <span className="sidebar-icon"><img src={logoIcon} alt="Logo" /></span>
            <span className="sidebar-project">Your project</span>
          </div>
          <button
            className="sidebar-iconbtn"
            aria-label="Toggle panel"
            type="button"
            onClick={() => onToggleCollapse?.()}
          >
            <img src={sidebarFoldIcon} alt="Toggle panel" />
          </button>
        </header>

        <button
          className="sidebar-newbtn"
          type="button"
          onClick={onNewSession}
        >
          New Session
        </button>

        <section className="sidebar-sessions">
          <div className="sidebar-sessions-head">
            <span className="sidebar-sessions-label">Sessions</span>
            <button
              className="sidebar-iconbtn"
              aria-label="Search sessions"
              type="button"
            >
              <img src={searchIcon} alt="Search" />
            </button>
          </div>
          <ul className="sidebar-list">
            {items.map((s) => (
              <li
                key={s.id}
                className={`sidebar-item ${s.active ? 'active' : ''}`}
                onClick={() => onSelect?.(s.id)}
              >
                <div className="sidebar-item-row">
                  <span className="sidebar-item-label">{s.label}</span>
                  {s.meta && <span className="sidebar-item-meta">{s.meta}</span>}
                </div>
                {s.date && (
                  <span className="sidebar-item-date">{s.date}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="sidebar-footer">
        <div className="sidebar-user">
          <span className="sidebar-icon"><img src={userIcon} alt="User" /></span>
          <span className="sidebar-user-name">Yoon Bae</span>
        </div>
        <button
          className="sidebar-iconbtn"
          aria-label="Settings"
          type="button"
          onClick={onSettings}
        >
          <img src={settingIcon} alt="Settings" />
        </button>
      </footer>
    </aside>
  )
}
