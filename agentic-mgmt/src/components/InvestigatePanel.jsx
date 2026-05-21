import { motion } from 'framer-motion'
import { lazy, Suspense, useState } from 'react'
import './InvestigatePanel.css'

const CadView3D = lazy(() => import('./CadView3D'))
const NotesApp = lazy(() => import('./desktop/NotesApp'))
const TerminalApp = lazy(() => import('./desktop/TerminalApp'))
const BrowserApp = lazy(() => import('./desktop/BrowserApp'))
const PythonEditor = lazy(() => import('./desktop/PythonEditor'))
const VideoPlayer = lazy(() => import('./desktop/VideoPlayer'))
const PhotoBooth = lazy(() => import('./desktop/PhotoBooth'))

const BRANCH_APP = {
  cad: {
    name: 'FreeCAD',
    file: 'falcon9_thruster.fcstd',
    icon: 'cad',
  },
  sim: {
    name: 'Python',
    file: 'thrust_sim.py',
    icon: 'py',
  },
  docs: {
    name: 'Pages',
    file: 'design_spec_v4.docx',
    icon: 'doc',
  },
}

const DOCK_DEMO = [
  { id: 'finder', label: 'Finder', kind: 'finder' },
  { id: 'cad', label: 'CAD', kind: 'cad' },
  { id: 'py', label: 'Python', kind: 'py' },
  { id: 'doc', label: 'Pages', kind: 'doc' },
  { id: 'mail', label: 'Mail', kind: 'mail' },
  { id: 'term', label: 'Terminal', kind: 'term' },
]

const DOCK_REAL = [
  { id: 'finder', label: 'Finder', kind: 'finder' },
  { id: 'cad', label: 'CAD', kind: 'cad' },
  { id: 'py', label: 'Python', kind: 'py' },
  { id: 'doc', label: 'Notes', kind: 'doc' },
  { id: 'browser', label: 'Browser', kind: 'browser' },
  { id: 'term', label: 'Terminal', kind: 'term' },
  { id: 'video', label: 'Video', kind: 'video' },
  { id: 'photo', label: 'Photo Booth', kind: 'photo' },
]

const DOCK_APP_MAP = {
  cad: { name: 'FreeCAD', file: 'model.fcstd', icon: 'cad' },
  py: { name: 'Python', file: 'script.py', icon: 'py' },
  doc: { name: 'Notes', file: 'notes.md', icon: 'doc' },
  browser: { name: 'Browser', file: 'Search', icon: 'browser' },
  term: { name: 'Terminal', file: 'bash', icon: 'term' },
  video: { name: 'Video Player', file: 'player', icon: 'video' },
  photo: { name: 'Photo Booth', file: 'camera', icon: 'photo' },
}

export default function InvestigatePanel({
  mode = 'demo',
  node,
  isApprovalContext,
  onClose,
  onApprove,
}) {
  const branch = node?.branch ?? 'cad'
  const app = BRANCH_APP[branch] ?? BRANCH_APP.cad
  const isReal = mode === 'real'
  const dock = isReal ? DOCK_REAL : DOCK_DEMO

  const [activeDockApp, setActiveDockApp] = useState(null)

  const currentApp = activeDockApp
    ? DOCK_APP_MAP[activeDockApp] || app
    : app
  const currentDockKind = activeDockApp || app.icon

  function handleDockClick(kind) {
    if (!isReal) return
    if (kind === 'finder') return
    setActiveDockApp(kind)
  }

  function renderContent() {
    if (isReal && activeDockApp) {
      return renderRealApp(activeDockApp)
    }

    if (isReal) {
      return renderRealBranch(branch, node, isApprovalContext)
    }

    return renderDemoBranch(branch, node, isApprovalContext)
  }

  return (
    <motion.div
      className="desktop"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 90, damping: 18, mass: 1 }}
    >
      <DesktopWallpaper />
      <MenuBar appName={currentApp.name} />

      <button
        className="desktop-close-btn"
        onClick={onClose}
        aria-label="Close"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 2l8 8M10 2l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="desktop-stage">
        <AppWindow
          app={currentApp}
          node={node}
          isApprovalContext={isApprovalContext}
        >
          <Suspense fallback={<LoadingFallback />}>
            {renderContent()}
          </Suspense>
        </AppWindow>
      </div>

      <Dock
        items={dock}
        activeKind={currentDockKind}
        interactive={isReal}
        onClick={handleDockClick}
      />

      {isApprovalContext && (
        <div className="desktop-actions">
          <button className="desktop-btn primary" onClick={onApprove}>
            Approve fix
          </button>
        </div>
      )}
    </motion.div>
  )
}

function renderRealApp(kind) {
  switch (kind) {
    case 'cad':
      return <CadView3D highlight={false} />
    case 'py':
      return <PythonEditor />
    case 'doc':
      return <NotesApp />
    case 'browser':
      return <BrowserApp />
    case 'term':
      return <TerminalApp />
    case 'video':
      return <VideoPlayer />
    case 'photo':
      return <PhotoBooth />
    default:
      return <NotesApp />
  }
}

function renderRealBranch(branch, node, isApprovalContext) {
  switch (branch) {
    case 'cad':
      return <CadView3D highlight={isApprovalContext} />
    case 'sim':
      return <PythonEditor />
    case 'docs':
      return <NotesApp initialContent={`<h2>${node?.label || 'Notes'}</h2><p>${node?.tooltip || node?.content || 'Investigation notes...'}</p>`} />
    default:
      return <NotesApp />
  }
}

function renderDemoBranch(branch, node, isApprovalContext) {
  switch (branch) {
    case 'cad':
      return <CadView3D highlight={isApprovalContext} />
    case 'sim':
      return <PythonView node={node} />
    case 'docs':
      return <DocsView node={node} />
    default:
      return <PythonView node={node} />
  }
}

function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'rgba(140,165,200,0.4)',
        fontSize: 10,
      }}
    >
      Loading…
    </div>
  )
}

// ---------------------------------------------------------------------------
// Desktop chrome
// ---------------------------------------------------------------------------

function DesktopWallpaper() {
  return (
    <div className="desktop-wallpaper" aria-hidden>
      <div className="desktop-wallpaper-glow" />
    </div>
  )
}

function MenuBar({ appName }) {
  const time = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return (
    <div className="menubar">
      <div className="menubar-left">
        <span className="menubar-apple"></span>
        <span className="menubar-app">{appName}</span>
        <span className="menubar-item">File</span>
        <span className="menubar-item">Edit</span>
        <span className="menubar-item">View</span>
        <span className="menubar-item">Window</span>
        <span className="menubar-item">Help</span>
      </div>
      <div className="menubar-right">
        <span className="menubar-status">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1 5a4 4 0 018 0M2.5 6a2.5 2.5 0 015 0M4 7a1 1 0 012 0"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </span>
        <span className="menubar-status">100%</span>
        <span className="menubar-status">{time}</span>
      </div>
    </div>
  )
}

function Dock({ items, activeKind, interactive, onClick }) {
  return (
    <div className="dock">
      {items.map((d) => (
        <div
          key={d.id}
          className={`dock-icon dock-icon-${d.kind} ${activeKind === d.kind ? 'active' : ''} ${interactive ? 'clickable' : ''}`}
          title={d.label}
          onClick={() => onClick?.(d.kind)}
          role={interactive ? 'button' : undefined}
        >
          <DockGlyph kind={d.kind} />
        </div>
      ))}
    </div>
  )
}

function DockGlyph({ kind }) {
  if (kind === 'cad') {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 12l8-6 8 6-8 6-8-6z" stroke="#fff" strokeWidth="1.5" />
        <path d="M12 6v12" stroke="#fff" strokeWidth="1" opacity="0.6" />
      </svg>
    )
  }
  if (kind === 'py') {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#fff" strokeWidth="1.2" />
        <path d="M7 9l3 3-3 3M12 15h5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
  }
  if (kind === 'doc') {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M6 3h9l4 4v14H6z" stroke="#fff" strokeWidth="1.2" />
        <path d="M9 11h8M9 14h8M9 17h5" stroke="#fff" strokeWidth="1" />
      </svg>
    )
  }
  if (kind === 'mail' || kind === 'browser') {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.2" />
        <ellipse cx="12" cy="12" rx="4" ry="9" stroke="#fff" strokeWidth="1.2" />
        <path d="M3.5 9h17M3.5 15h17" stroke="#fff" strokeWidth="0.8" />
      </svg>
    )
  }
  if (kind === 'term') {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="#fff" strokeWidth="1.2" />
        <path d="M6 9l3 3-3 3M11 15h5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
  }
  if (kind === 'video') {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#fff" strokeWidth="1.2" />
        <path d="M10 9l5 3-5 3V9z" fill="#fff" opacity="0.8" />
      </svg>
    )
  }
  if (kind === 'photo') {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#fff" strokeWidth="1.2" />
        <circle cx="12" cy="12" r="3.5" stroke="#fff" strokeWidth="1.2" />
        <circle cx="12" cy="12" r="1.5" fill="#fff" opacity="0.6" />
      </svg>
    )
  }
  // finder default
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.2" />
      <path d="M9 10v4M15 10v4M9 17c1 1 5 1 6 0" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// App window
// ---------------------------------------------------------------------------

function AppWindow({ app, node, isApprovalContext, children }) {
  return (
    <div className="appwin">
      <div className="appwin-chrome">
        <div className="appwin-traffic">
          <span className="tl tl-red" />
          <span className="tl tl-yellow" />
          <span className="tl tl-green" />
        </div>
        <div className="appwin-title">
          {app.name} — {app.file}
        </div>
        <div className="appwin-meta">
          {isApprovalContext ? 'flagged' : node?.label ?? ''}
        </div>
      </div>
      <div className="appwin-body">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Per-app content (demo mode only)
// ---------------------------------------------------------------------------

function PythonView({ node }) {
  const stage = (node?.label ?? '').toLowerCase()
  return (
    <div className="pyview">
      <div className="pyview-tabs">
        <span className="pyview-tab active">thrust_sim.py</span>
        <span className="pyview-tab">propellant.csv</span>
      </div>
      <pre className="pyview-pre">
        <code>
          <span className="pyc-meta">$ python thrust_sim.py</span>{'\n'}
          <span className="pyc-dim">[init] loading constants from propellant.csv</span>{'\n'}
          <span className="pyc-dim">[init] LOX/RP-1 mixture ratio = 2.34</span>{'\n'}
          <span className="pyc-dim">[init] chamber pressure target = 9.7 MPa</span>{'\n'}
          {'\n'}
          <span className="pyc-step">→ {node?.label}</span>{'\n'}
          {stage.includes('isp') && (
            <>
              <span className="pyc-out">  Isp_vac = 311 s</span>{'\n'}
              <span className="pyc-out">  Isp_sl  = 282 s</span>{'\n'}
            </>
          )}
          {stage.includes('pressure') && (
            <>
              <span className="pyc-out">  Pc_sweep = [9.6, 9.7, 9.8] MPa</span>{'\n'}
              <span className="pyc-out">  ΔPc max = 1.2% (within tol)</span>{'\n'}
            </>
          )}
          {stage.includes('complete') && (
            <>
              <span className="pyc-out">  Thrust (sl) = 854 kN</span>{'\n'}
              <span className="pyc-ok">  ✓ nominal across envelope</span>{'\n'}
            </>
          )}
          {!stage.includes('isp') &&
            !stage.includes('pressure') &&
            !stage.includes('complete') && (
              <>
                <span className="pyc-out">  ...</span>{'\n'}
                <span className="pyc-ok">  ✓ step complete</span>{'\n'}
              </>
            )}
        </code>
      </pre>
    </div>
  )
}

function DocsView({ node }) {
  return (
    <div className="docview">
      <div className="docview-title">Falcon 9 Design Specification</div>
      <div className="docview-sub">Revision 4.1 · {node?.label}</div>
      <div className="docview-page">
        <div className="docview-h">3. Thrust Chamber</div>
        <p className="docview-p">
          The first-stage thrust chamber is fabricated from Inconel 718 with a
          regenerative cooling jacket. Chamber pressure is held at 9.7 MPa
          nominal across the burn envelope.
        </p>
        <div className="docview-h">3.2 Wall thickness</div>
        <p className="docview-p">
          Minimum wall thickness at the throat shall not fall below{' '}
          <span className="docview-strike">2.1 mm</span>{' '}
          <span className="docview-add">2.5 mm</span> per MMP-FAL-013.
        </p>
        <div className="docview-h">3.4 CAD references</div>
        <p className="docview-p docview-meta">
          part: thrust_chamber_v4 · rev: 4.1 · last sync: today
        </p>
      </div>
    </div>
  )
}
