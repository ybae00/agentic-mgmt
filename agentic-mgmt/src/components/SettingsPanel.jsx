import { useState } from 'react'
import { motion } from 'framer-motion'
import './SettingsPanel.css'

const NAV_ITEMS = [
  { id: 'general', label: 'General', icon: 'general' },
  { id: 'agents', label: 'Agents', icon: 'agents' },
  { id: 'models', label: 'Models', icon: 'models' },
  { id: 'mcp', label: 'Tools & MCPs', icon: 'mcp' },
  { id: 'plugins', label: 'Plugins', icon: 'plugins' },
  { id: 'network', label: 'Network', icon: 'network' },
]

const MCP_APPS = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repository & code management',
    status: 'connected',
    color: '#24292f',
    icon: (
      <svg viewBox="0 0 24 24" fill="#24292f">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85.004 1.7.114 2.5.34 1.9-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.16.59.67.5A10.003 10.003 0 0022 12c0-5.523-4.477-10-10-10z"/>
      </svg>
    ),
  },
  {
    id: 'python',
    name: 'Python',
    description: 'Script execution & automation',
    status: 'connected',
    color: '#3776ab',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M11.9 2C7.1 2 7.5 4.2 7.5 4.2l.005 2.3H12v.7H5.3S2 6.8 2 12c0 5.2 2.9 5 2.9 5h1.7v-2.4s-.1-2.9 2.8-2.9h4.9s2.7 0 2.7-2.7V5.1S17.5 2 11.9 2zm-2.7 1.8c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9z" fill="#3776AB"/>
        <path d="M12.1 22c4.8 0 4.4-2.2 4.4-2.2l-.005-2.3H12v-.7h6.7S22 17.2 22 12c0-5.2-2.9-5-2.9-5h-1.7v2.4s.1 2.9-2.8 2.9h-4.9s-2.7 0-2.7 2.7v3.9S6.5 22 12.1 22zm2.7-1.8c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z" fill="#FFD43B"/>
      </svg>
    ),
  },
  {
    id: 'matlab',
    name: 'MATLAB',
    description: 'Numerical computing & simulation',
    status: 'connected',
    color: '#0076a8',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 18c2-3 3.5-6.5 5-6.5s2 2.5 3.5 2.5 2.5-4 4-7.5" stroke="#0076A8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11.5c1-2.5 2.5-6 4-6s2 3 3.5 3 3-4 4.5-4" stroke="#D4412E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
        <path d="M12.5 14c1-1.5 2-3.5 3-3.5s1.5 1.5 2.5 1.5 2-2.5 3-4" stroke="#EDB120" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      </svg>
    ),
  },
  {
    id: 'autocad',
    name: 'AutoCAD',
    description: 'CAD design & drafting',
    status: 'connected',
    color: '#e51937',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="3" fill="#E51937"/>
        <path d="M6 17l4-10h1.5l4 10h-1.6l-1-2.6H8.6L7.6 17H6zm3.1-4h3.3L10.8 8.5h-.1L9.1 13z" fill="#fff"/>
      </svg>
    ),
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Design tool integration',
    status: 'connected',
    color: '#a259ff',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4z" fill="#0ACF83"/>
        <path d="M4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z" fill="#A259FF"/>
        <path d="M4 4c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4z" fill="#F24E1E"/>
        <path d="M12 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0z" fill="#FF7262"/>
        <path d="M20 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z" fill="#1ABCFE"/>
      </svg>
    ),
  },
  {
    id: 'excel',
    name: 'Excel',
    description: 'Spreadsheet analysis & data',
    status: 'connected',
    color: '#217346',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="3" fill="#217346"/>
        <path d="M7 7l3.5 5L7 17h2.2l2.3-3.6L13.8 17H16l-3.5-5L16 7h-2.2l-2.3 3.6L9.2 7H7z" fill="#fff"/>
      </svg>
    ),
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Issue tracking & project management',
    status: 'connected',
    color: '#5e6ad2',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M3.35 14.63a9.6 9.6 0 01-.35-2.56c0-.26.01-.52.03-.78l3.81 3.81a7.14 7.14 0 01-3.49-.47zM4.2 17.2l5.67 5.67a9.7 9.7 0 01-3.55-1.42L4.2 19.32a9.5 9.5 0 01-.01-2.12zM6.42 21.4a9.62 9.62 0 004.49 1.55L6.42 18.46v2.93zM21.65 9.37a9.6 9.6 0 01.35 2.56c0 5.3-4.3 9.6-9.6 9.6-.26 0-.52-.01-.78-.03L21.65 9.37z" fill="#5e6ad2"/>
        <path d="M12 2.47A9.53 9.53 0 002.47 12c0 .89.12 1.75.35 2.56L14.56 2.82A9.53 9.53 0 0012 2.47z" fill="#5e6ad2"/>
      </svg>
    ),
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Deployment & hosting',
    status: 'connected',
    color: '#000000',
    icon: (
      <svg viewBox="0 0 24 24" fill="#000000">
        <path d="M12 2L2 19.5h20L12 2z"/>
      </svg>
    ),
  },
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'AI-powered code editor',
    status: 'connected',
    color: '#f0f0f0',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="#000"/>
        <path d="M7 8l5 4-5 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="13" y1="16" x2="17" y2="16" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication',
    status: 'connected',
    color: '#e01e5a',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M6.5 14.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm1 0a1.5 1.5 0 113 0v4a1.5 1.5 0 11-3 0v-4z" fill="#E01E5A"/>
        <path d="M9.5 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 1a1.5 1.5 0 110 3h-4a1.5 1.5 0 110-3h4z" fill="#36C5F0"/>
        <path d="M17.5 9.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm-1 0a1.5 1.5 0 11-3 0v-4a1.5 1.5 0 113 0v4z" fill="#2EB67D"/>
        <path d="M14.5 17.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0-1a1.5 1.5 0 110-3h4a1.5 1.5 0 110 3h-4z" fill="#ECB22E"/>
      </svg>
    ),
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Knowledge base & documentation',
    status: 'disconnected',
    color: '#f0f0f0',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.5 3.5l1.3.1c.7.5.9.5 2 .4l9-0.7c.3 0 .1-.3 0-.3l-1.5-1.1c-.5-.4-1.1-.4-1.8-.3l-8.7.6c-.5.1-.6.3-.4.5l.1.8zM5.8 6.5v11.2c0 .6.3.8.9.8l10.7-.6c.6 0 .7-.4.7-.8V6.3c0-.4-.2-.6-.5-.6l-11.2.6c-.4 0-.6.2-.6.6v-.4zM16 7.3c.1.3 0 .6-.3.7l-.5.1v8.2c-.4.2-.8.3-1.2.3-.5 0-.7-.2-1.1-.6l-3.4-5.3v5.1l1 .2s0 .6-.8.6l-2.3.1c-.1-.1 0-.5.2-.6l.7-.2V8.5l-.9-.1c-.1-.3.1-.8.6-.8l2.4-.2 3.5 5.4V8.3l-.9-.1c-.1-.4.2-.6.5-.7l2.5-.2z"/>
      </svg>
    ),
  },
]

const NAV_ICONS = {
  general: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 3.2 V 5.6 M12 18.4 V 20.8 M3.2 12 H 5.6 M18.4 12 H 20.8 M5.8 5.8 L 7.5 7.5 M16.5 16.5 L 18.2 18.2 M5.8 18.2 L 7.5 16.5 M16.5 7.5 L 18.2 5.8" />
    </svg>
  ),
  agents: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="9" cy="10" r="1.5" />
      <circle cx="15" cy="10" r="1.5" />
      <path d="M9 15h6" />
    </svg>
  ),
  models: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L3 8v8l9 5 9-5V8l-9-5z" />
      <path d="M3 8l9 5 9-5M12 13v9" />
    </svg>
  ),
  mcp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  plugins: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M8 4h8M9 6v3a3 3 0 006 0V6" />
      <path d="M7 12h10v6a4 4 0 01-4 4h-2a4 4 0 01-4-4v-6z" />
    </svg>
  ),
  network: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3.5 9h17M3.5 15h17" />
    </svg>
  ),
}

export default function SettingsPanel({ onClose }) {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <motion.div
      className="settings-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="settings-panel"
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <div className="settings-nav">
          <div className="settings-nav-header">
            <span className="settings-nav-title">Settings</span>
          </div>
          <ul className="settings-nav-list">
            {NAV_ITEMS.map((item) => (
              <li
                key={item.id}
                className={`settings-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="settings-nav-icon">{NAV_ICONS[item.icon]}</span>
                <span className="settings-nav-label">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="settings-content">
          <div className="settings-content-header">
            <h2 className="settings-content-title">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </h2>
            <button
              className="settings-close"
              onClick={onClose}
              aria-label="Close settings"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>
          </div>

          <div className="settings-content-body">
            {activeTab === 'general' && <GeneralTab />}
            {activeTab === 'mcp' && <McpTab />}
            {activeTab === 'agents' && <PlaceholderTab label="Agents" />}
            {activeTab === 'models' && <PlaceholderTab label="Models" />}
            {activeTab === 'plugins' && <PlaceholderTab label="Plugins" />}
            {activeTab === 'network' && <PlaceholderTab label="Network" />}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function GeneralTab() {
  const [systemNotifs, setSystemNotifs] = useState(true)
  const [warningNotifs, setWarningNotifs] = useState(false)
  const [completionSound, setCompletionSound] = useState(true)
  const [menuBarIcon, setMenuBarIcon] = useState(true)

  return (
    <div className="settings-general">
      <section className="settings-section">
        <div className="settings-section-title">Account</div>
        <div className="settings-row">
          <div className="settings-row-text">
            <div className="settings-row-label">Workspace Account</div>
            <div className="settings-row-desc">Manage your account and billing</div>
          </div>
          <button className="settings-btn-outline" type="button">Open</button>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title">Notifications</div>
        <div className="settings-row">
          <div className="settings-row-text">
            <div className="settings-row-label">System Notifications</div>
            <div className="settings-row-desc">Show system notifications when Agent completes or needs attention</div>
          </div>
          <Toggle checked={systemNotifs} onChange={setSystemNotifs} />
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <div className="settings-row-label">Warning Notifications</div>
            <div className="settings-row-desc">Show warning-level in-app toasts</div>
          </div>
          <Toggle checked={warningNotifs} onChange={setWarningNotifs} />
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <div className="settings-row-label">Menu Bar Icon</div>
            <div className="settings-row-desc">Show application icon in menu bar</div>
          </div>
          <Toggle checked={menuBarIcon} onChange={setMenuBarIcon} />
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <div className="settings-row-label">Completion Sound</div>
            <div className="settings-row-desc">Play a sound when Agent finishes responding</div>
          </div>
          <Toggle checked={completionSound} onChange={setCompletionSound} />
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title">Privacy</div>
        <div className="settings-row">
          <div className="settings-row-text">
            <div className="settings-row-label">Privacy Mode</div>
            <div className="settings-row-desc">Your code data will not be trained on or used to improve the product. Code may be stored to provide features such as Background Agent.</div>
          </div>
          <button className="settings-btn-outline" type="button">Privacy Mode</button>
        </div>
      </section>
    </div>
  )
}

function McpTab() {
  return (
    <div className="settings-mcp">
      <div className="settings-mcp-header">
        <p className="settings-mcp-desc">
          Model Context Protocol servers extend your agent's capabilities with external tools and data sources.
        </p>
        <button className="settings-btn-primary" type="button">+ Add MCP</button>
      </div>

      <section className="settings-section">
        <div className="settings-section-title">Connected</div>
        <div className="settings-mcp-grid">
          {MCP_APPS.filter((a) => a.status === 'connected').map((app) => (
            <McpAppCard key={app.id} app={app} />
          ))}
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title">Available</div>
        <div className="settings-mcp-grid">
          {MCP_APPS.filter((a) => a.status === 'disconnected').map((app) => (
            <McpAppCard key={app.id} app={app} />
          ))}
        </div>
      </section>
    </div>
  )
}

function McpAppCard({ app }) {
  const connected = app.status === 'connected'
  return (
    <div className={`mcp-card ${connected ? 'connected' : ''}`}>
      <div className="mcp-card-icon" style={{ color: app.color }}>
        {app.icon}
      </div>
      <div className="mcp-card-info">
        <div className="mcp-card-name">{app.name}</div>
        <div className="mcp-card-desc">{app.description}</div>
      </div>
      <div className="mcp-card-status">
        {connected ? (
          <span className="mcp-status-dot connected" />
        ) : (
          <button className="settings-btn-sm" type="button">Connect</button>
        )}
      </div>
    </div>
  )
}

function PlaceholderTab({ label }) {
  return (
    <div className="settings-placeholder">
      <div className="settings-placeholder-icon">
        {NAV_ICONS[NAV_ITEMS.find((n) => n.label === label)?.icon ?? 'general']}
      </div>
      <p className="settings-placeholder-text">{label} settings</p>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      className={`settings-toggle ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span className="settings-toggle-thumb" />
    </button>
  )
}
