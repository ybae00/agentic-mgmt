import { motion } from 'framer-motion'
import './InvestigatePanel.css'

// Map a node's branch to the "app" the agent would have been using.
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

// Re-used dock layout across the whole desktop.
const DOCK = [
  { id: 'finder', label: 'Finder', kind: 'finder' },
  { id: 'cad', label: 'CAD', kind: 'cad' },
  { id: 'py', label: 'Python', kind: 'py' },
  { id: 'doc', label: 'Pages', kind: 'doc' },
  { id: 'mail', label: 'Mail', kind: 'mail' },
  { id: 'term', label: 'Terminal', kind: 'term' },
]

export default function InvestigatePanel({
  node,
  isApprovalContext,
  onClose,
  onApprove,
}) {
  const branch = node?.branch ?? 'cad'
  const app = BRANCH_APP[branch] ?? BRANCH_APP.cad

  return (
    <motion.div
      className="desktop"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 90, damping: 18, mass: 1 }}
    >
      <DesktopWallpaper />
      <MenuBar appName={app.name} />

      <div className="desktop-stage">
        <AppWindow app={app} node={node} isApprovalContext={isApprovalContext}>
          {branch === 'cad' && (
            <CadView highlight={isApprovalContext} node={node} />
          )}
          {branch === 'sim' && <PythonView node={node} />}
          {branch === 'docs' && <DocsView node={node} />}
        </AppWindow>
      </div>

      <Dock activeKind={app.icon} />

      <div className="desktop-actions">
        <button className="desktop-btn ghost" onClick={onClose}>
          {isApprovalContext ? 'Back' : 'Close'}
        </button>
        {isApprovalContext && (
          <button className="desktop-btn primary" onClick={onApprove}>
            Approve fix
          </button>
        )}
      </div>
    </motion.div>
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
  const time = '04:21'
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

function Dock({ activeKind }) {
  return (
    <div className="dock">
      {DOCK.map((d) => (
        <div
          key={d.id}
          className={`dock-icon dock-icon-${d.kind} ${activeKind === d.kind ? 'active' : ''}`}
          title={d.label}
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
  if (kind === 'mail') {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="12" rx="2" stroke="#fff" strokeWidth="1.2" />
        <path d="M3 8l9 6 9-6" stroke="#fff" strokeWidth="1.2" />
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
// Per-app content
// ---------------------------------------------------------------------------

function CadView({ highlight }) {
  return (
    <div className="cadview">
      <div className="cadview-sidebar">
        <div className="cadview-sidebar-title">Model tree</div>
        <ul className="cadview-tree">
          <li>Falcon 9 assembly</li>
          <li className="indent">Thruster bay</li>
          <li className={`indent2 ${highlight ? 'flagged' : ''}`}>
            thrust_chamber_v4
          </li>
          <li className="indent2">nozzle_bell</li>
          <li className="indent2">gimbal_mount</li>
        </ul>
      </div>
      <div className="cadview-viewport">
        <svg viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid2" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="400" height="480" fill="url(#grid2)" />

          {/* left outer wall */}
          <path d="M 130 40 L 130 200 L 100 260 L 60 460" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
          {/* left inner */}
          <path d="M 150 40 L 150 200 L 130 260 L 100 460" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeDasharray="3 3" />
          {/* right outer top */}
          <path d="M 270 40 L 270 200" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
          {/* flagged segment */}
          {highlight && (
            <path d="M 270 60 L 270 180" fill="none" stroke="#e05454" strokeWidth="3" />
          )}
          <path d="M 270 200 L 300 260 L 340 460" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
          {/* right inner */}
          <path d="M 250 40 L 250 200 L 270 260 L 300 460" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeDasharray="3 3" />
          {/* throat band */}
          <line x1="150" y1="200" x2="250" y2="200" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 4" />
          {highlight && (
            <>
              <line x1="270" y1="120" x2="340" y2="120" stroke="#e05454" strokeWidth="1" />
              <line x1="340" y1="115" x2="340" y2="125" stroke="#e05454" strokeWidth="1" />
            </>
          )}
        </svg>

        {highlight && (
          <div className="cadview-callout">
            <div className="cadview-callout-dot" />
            <div className="cadview-callout-text">
              <div className="cadview-callout-label">Chamber wall</div>
              <div className="cadview-callout-value">
                2.1 mm <span className="cadview-callout-meta">/ 2.5 mm min</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

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
