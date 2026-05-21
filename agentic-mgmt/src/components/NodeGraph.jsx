import { useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { AnimatePresence } from 'framer-motion'
import ApprovalPopover from './ApprovalPopover.jsx'
import SelectionPopover from './SelectionPopover.jsx'
import './NodeGraph.css'

const STATE_COLORS = {
  active: '#2a72e0',
  complete: '#888888',
  'needs-approval': '#FF9900',
}

const FINAL_COLOR = '#2a9d6f'

const HALO_COLORS = {
  active: 'rgba(42, 114, 224, ',
  'needs-approval': 'rgba(255, 153, 0, ',
}

const BRANCH_CATEGORIES = {
  sim: 'Python',
  cad: 'CAD',
  docs: 'Docs',
  root: 'System',
  final: 'System',
}

const BRANCH_ICONS = {
  sim: (
    <svg viewBox="0 0 256 255" className="graph-tooltip-icon">
      <defs>
        <linearGradient id="pyBlue" x1="12.96%" y1="12.07%" x2="79.64%" y2="78.8%">
          <stop offset="0%" stopColor="#387EB8"/>
          <stop offset="100%" stopColor="#366994"/>
        </linearGradient>
        <linearGradient id="pyYellow" x1="19.13%" y1="20.58%" x2="90.43%" y2="88.01%">
          <stop offset="0%" stopColor="#FFC836"/>
          <stop offset="100%" stopColor="#FFD43B"/>
        </linearGradient>
      </defs>
      <path d="M126.9 0C62.7 0 66.7 27.6 66.7 27.6l.1 28.6h61.3v8.6H39.2S0 60.7 0 126.2c0 65.5 34.2 63.2 34.2 63.2h20.4v-30.4s-1.1-34.2 33.7-34.2h58c32.3 0 34-33.1 34-33.1V33.1S184.3 0 126.9 0zM92.3 19.1a11 11 0 110 22 11 11 0 010-22z" fill="url(#pyBlue)"/>
      <path d="M128.8 254.1c64.2 0 60.2-27.6 60.2-27.6l-.1-28.6h-61.3v-8.6h88.9s39.2 4.1 39.2-61.4c0-65.5-34.2-63.2-34.2-63.2h-20.4v30.4s1.1 34.2-33.7 34.2h-58c-32.3 0-34 33.1-34 33.1v58.7s-5.2 33-60.2 33zm34.6-19.1a11 11 0 110-22 11 11 0 010 22z" fill="url(#pyYellow)"/>
    </svg>
  ),
  cad: (
    <svg viewBox="0 0 24 24" className="graph-tooltip-icon">
      <rect width="24" height="24" rx="4" fill="#D42B2B"/>
      <path d="M7 17L12 5l5 12h-2.4l-1-2.8H10.4L9.4 17H7zm4-4.6h2l-1-2.8-1 2.8z" fill="#fff"/>
    </svg>
  ),
  docs: (
    <svg viewBox="0 0 24 24" fill="none" className="graph-tooltip-icon">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#4285F4"/>
      <path d="M14 2v6h6" fill="#A1C2FA"/>
      <path d="M8 13h8M8 17h5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  root: (
    <svg viewBox="0 0 24 24" fill="none" className="graph-tooltip-icon">
      <circle cx="12" cy="12" r="10" fill="#888"/>
      <path d="M12 8v4l3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  final: (
    <svg viewBox="0 0 24 24" fill="none" className="graph-tooltip-icon">
      <circle cx="12" cy="12" r="10" fill="#2a9d6f"/>
      <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

function getCategoryIcon(node) {
  return BRANCH_ICONS[node.branch] || BRANCH_ICONS.root
}

function isStatusNode(node) {
  return node.branch === 'sim'
}

function getCategoryLabel(node) {
  return BRANCH_CATEGORIES[node.branch] || node.branch
}

function getStatusBadge(node) {
  if (node.state === 'complete') return { label: 'Nominal', cls: 'badge-nominal' }
  if (node.state === 'active') return { label: 'Running', cls: 'badge-running' }
  if (node.state === 'needs-approval') return { label: 'Pending', cls: 'badge-pending' }
  return { label: 'Nominal', cls: 'badge-nominal' }
}

// d3-force tuning — bigger numbers spread nodes apart, makes the graph
// easier to read at a glance.
const FORCE_LINK_DISTANCE = 90
const FORCE_CHARGE_STRENGTH = -260

// Build {nodes, links} for the force graph. Reuses node objects across
// renders so d3-force-preserved x/y/vx/vy survive demo-runner updates.
function useGraphData(session, runtimeStates) {
  const cacheRef = useRef(new Map())

  return useMemo(() => {
    const cache = cacheRef.current

    const sourceNodes =
      session.kind === 'demo'
        ? session.nodes.filter((n) => runtimeStates[n.id])
        : session.nodes

    const stateOf = (id) =>
      session.kind === 'demo' ? runtimeStates[id] : 'complete'

    const seen = new Set()
    const nodes = sourceNodes.map((n) => {
      let cached = cache.get(n.id)
      const isNew = !cached
      if (isNew) {
        cached = { id: n.id }
        cache.set(n.id, cached)
        // Spawn new nodes at their parent's current position with zero
        // velocity, so they slide outward in a straight line as the force
        // simulation pulls them to rest — no swooping arc from (0,0).
        const parents =
          n.parent == null
            ? []
            : Array.isArray(n.parent)
              ? n.parent
              : [n.parent]
        for (const pid of parents) {
          const parent = cache.get(pid)
          if (
            parent &&
            Number.isFinite(parent.x) &&
            Number.isFinite(parent.y)
          ) {
            cached.x = parent.x
            cached.y = parent.y
            cached.vx = 0
            cached.vy = 0
            break
          }
        }
      }
      cached.label = n.label
      cached.tooltip = n.tooltip
      cached.branch = n.branch
      cached.state = stateOf(n.id)
      seen.add(n.id)
      return cached
    })

    // Drop cached nodes that belong to a different session.
    for (const id of cache.keys()) {
      if (!seen.has(id)) cache.delete(id)
    }

    const visibleSet = new Set(sourceNodes.map((n) => n.id))
    const links = []
    for (const n of sourceNodes) {
      if (n.parent == null) continue
      const parents = Array.isArray(n.parent) ? n.parent : [n.parent]
      for (const p of parents) {
        if (!visibleSet.has(p)) continue
        const childState = stateOf(n.id)
        links.push({
          source: p,
          target: n.id,
          active: childState === 'active' || childState === 'needs-approval',
        })
      }
    }

    return { nodes, links }
  }, [session, runtimeStates])
}

export default function NodeGraph({
  session,
  runtimeStates,
  approvalPending,
  approvalNodeId,
  compressed,
  sidebarCollapsed,
  chatFolded,
  onApprove,
  onInvestigate,
  onSeeTask,
  onAskNous,
}) {
  const containerRef = useRef(null)
  const fgRef = useRef(null)
  const selectionRef = useRef(null)
  const tooltipRef = useRef(null)

  const [size, setSize] = useState({ w: 0, h: 0 })
  const [hoveredId, setHoveredId] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const graphData = useGraphData(session, runtimeStates)

  // Adjacency map of selected node — used to highlight neighbors and dim
  // everything else when the user clicks a node.
  const neighborSet = useMemo(() => {
    if (!selectedId) return null
    const s = new Set([selectedId])
    for (const l of graphData.links) {
      const src = typeof l.source === 'object' ? l.source.id : l.source
      const tgt = typeof l.target === 'object' ? l.target.id : l.target
      if (src === selectedId) s.add(tgt)
      if (tgt === selectedId) s.add(src)
    }
    return s
  }, [selectedId, graphData])

  // When a needs-approval node appears, snap the camera to it and open its popover.
  useEffect(() => {
    if (!approvalPending || !approvalNodeId) return
    const node = graphData.nodes.find((n) => n.id === approvalNodeId)
    if (!node) return
    const t = setTimeout(() => {
      const fg = fgRef.current
      if (!fg) return
      try {
        fg.centerAt(node.x, node.y, 600)
        fg.zoom(fg.zoom(), 600)
      } catch {}
      setSelectedId(approvalNodeId)
      setPopoverOpen(true)
    }, 300)
    return () => clearTimeout(t)
  }, [approvalPending, approvalNodeId])

  // Reset popovers + selection when approval clears or session changes.
  useEffect(() => {
    if (!approvalPending) setPopoverOpen(false)
  }, [approvalPending])

  useEffect(() => {
    setSelectedId(null)
    setPopoverOpen(false)
  }, [session.id])

  // Track container size so the canvas resizes on viewport / compress changes.
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setSize({ w: width, h: height })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Configure d3-force once we have a graph instance — wider link distance
  // and stronger repulsion so the graph reads at a glance.
  useEffect(() => {
    const fg = fgRef.current
    if (!fg) return
    try {
      fg.d3Force('link')?.distance(FORCE_LINK_DISTANCE)
      fg.d3Force('charge')?.strength(FORCE_CHARGE_STRENGTH)
    } catch {}
  }, [size.w, size.h])

  // Recenter when session changes, then pull back 30% so the user sees the
  // whole graph with breathing room before they start panning.
  useEffect(() => {
    if (!fgRef.current) return
    const t1 = setTimeout(() => {
      const fg = fgRef.current
      if (!fg) return
      try {
        fg.zoomToFit(400, 120)
      } catch {}
    }, 250)
    const t2 = setTimeout(() => {
      const fg = fgRef.current
      if (!fg) return
      try {
        fg.zoom(fg.zoom() * 0.7, 500)
      } catch {}
    }, 750)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [session.id])

  // Custom node renderer — dots + state halo + label when zoomed/hovered.
  const nodeCanvas = useMemo(() => {
    return (node, ctx, globalScale) => {
      const isAnchor = node.branch === 'root' || node.branch === 'final'
      const r = isAnchor ? 7.5 : 5.25
      const color = node.branch === 'final' && node.state === 'complete'
        ? FINAL_COLOR
        : STATE_COLORS[node.state] || STATE_COLORS.complete

      // Dim non-neighbors when a node is selected (Obsidian-style focus).
      const dim = neighborSet && !neighborSet.has(node.id)
      const alpha = dim ? 0.22 : 1
      ctx.globalAlpha = alpha

      // Pulsing halo for active / needs-approval / selected states
      if (node.state === 'active' || node.state === 'needs-approval') {
        const t = performance.now() / 1000
        const pulse = (Math.sin(t * Math.PI) + 1) / 2
        ctx.beginPath()
        ctx.arc(node.x, node.y, r + 2 + pulse * 5, 0, 2 * Math.PI)
        ctx.strokeStyle = HALO_COLORS[node.state] + (0.15 + pulse * 0.35) + ')'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Ring for selected node — solid, no pulse
      if (node.id === selectedId) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, r + 4, 0, 2 * Math.PI)
        ctx.strokeStyle = 'rgba(26, 26, 26, 0.7)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()

      // Labels are always visible. Font scales with zoom but is clamped so it
      // stays readable far out and not absurd close in.
      const fontSize = Math.min(11, Math.max(7, 9 / globalScale))
      ctx.font = `400 ${fontSize}px Inter, system-ui, sans-serif`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      const highlighted = node.id === hoveredId || node.id === selectedId
      ctx.fillStyle = highlighted
        ? 'rgba(26, 26, 26, 0.95)'
        : 'rgba(26, 26, 26, 0.65)'
      ctx.fillText(node.label, node.x + r + 5, node.y)

      ctx.globalAlpha = 1
    }
  }, [hoveredId, selectedId, neighborSet])

  // Larger invisible hit area so the tiny dots are easy to click/hover.
  const nodePointer = (node, color, ctx) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI)
    ctx.fill()
  }

  const linkColor = (link) => {
    if (neighborSet) {
      const src = typeof link.source === 'object' ? link.source.id : link.source
      const tgt = typeof link.target === 'object' ? link.target.id : link.target
      const touchesSelected = src === selectedId || tgt === selectedId
      if (touchesSelected) return 'rgba(26, 26, 26, 0.8)'
      return 'rgba(0, 0, 0, 0.05)'
    }
    return link.active ? 'rgba(42, 114, 224, 0.6)' : 'rgba(0, 0, 0, 0.14)'
  }
  const linkWidth = (link) => {
    if (neighborSet) {
      const src = typeof link.source === 'object' ? link.source.id : link.source
      const tgt = typeof link.target === 'object' ? link.target.id : link.target
      const touchesSelected = src === selectedId || tgt === selectedId
      return touchesSelected ? 2 : 1
    }
    return link.active ? 1.6 : 1
  }

  function handleNodeClick(node) {
    setSelectedId(node.id)
    if (
      session.kind === 'demo' &&
      approvalPending &&
      node.id === approvalNodeId
    ) {
      setPopoverOpen(true)
    }
    // gently center on the clicked node so the popover lands in view
    if (fgRef.current) {
      try {
        fgRef.current.centerAt(node.x, node.y, 400)
      } catch {}
    }
  }

  function handleBackgroundClick() {
    setSelectedId(null)
    setPopoverOpen(false)
  }

  // Every node is clickable now — set pointer cursor on hover.
  const handleNodeHover = (node) => {
    setHoveredId(node?.id ?? null)
    if (containerRef.current) {
      containerRef.current.style.cursor = node ? 'pointer' : ''
    }
  }

  // No longer tracking amber node — approval popover is centered on canvas.

  // Anchor the selection popover. Hidden while the approval popover is up,
  // since they'd overlap on the same node.
  const selectionPopoverVisible =
    selectedId && !(popoverOpen && selectedId === approvalNodeId)
  useEffect(() => {
    if (!selectionPopoverVisible) return
    let raf
    const tick = () => {
      const fg = fgRef.current
      const el = selectionRef.current
      const node = graphData.nodes.find((n) => n.id === selectedId)
      if (fg && el && node && Number.isFinite(node.x) && Number.isFinite(node.y)) {
        const { x, y } = fg.graph2ScreenCoords(node.x, node.y)
        el.style.transform = `translate(${x}px, ${y + 16}px) translateX(-50%)`
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [selectionPopoverVisible, selectedId, graphData])

  const selectedNode = selectedId
    ? graphData.nodes.find((n) => n.id === selectedId)
    : null

  // Hover tooltip — only shown while a node is hovered and it isn't already
  // selected (the selection popover covers that case).
  const hoveredNode = hoveredId
    ? graphData.nodes.find((n) => n.id === hoveredId)
    : null
  const tooltipVisible = !!hoveredNode && hoveredId !== selectedId

  useEffect(() => {
    if (!tooltipVisible) return
    let raf
    const tick = () => {
      const fg = fgRef.current
      const el = tooltipRef.current
      const node = hoveredNode
      if (fg && el && node && Number.isFinite(node.x) && Number.isFinite(node.y)) {
        const { x, y } = fg.graph2ScreenCoords(node.x, node.y)
        // Place to the right of the node by default; the CSS handles
        // wrapping if it ends up against the right edge.
        el.style.transform = `translate(${x + 14}px, ${y}px) translateY(-50%)`
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [tooltipVisible, hoveredNode])

  return (
    <div
      ref={containerRef}
      className={`graph ${compressed ? 'compressed' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${chatFolded ? 'chat-folded' : ''}`}
    >
      {size.w > 0 && size.h > 0 && (
       <div className="graph-canvas-wrap">
        <ForceGraph2D
          ref={fgRef}
          width={size.w}
          height={size.h}
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          cooldownTime={Infinity}
          d3VelocityDecay={0.55}
          nodeRelSize={4}
          nodeCanvasObject={nodeCanvas}
          nodePointerAreaPaint={nodePointer}
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkDirectionalParticles={(l) => (l.active ? 2 : 0)}
          linkDirectionalParticleSpeed={0.008}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={() => 'rgba(42,114,224,0.9)'}
          enableZoomInteraction
          enablePanInteraction
          enableNodeDrag
          minZoom={0.3}
          maxZoom={4}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          onBackgroundClick={handleBackgroundClick}
        />
       </div>
      )}

      {/* Hover tooltip — read-only description that follows the cursor's
          node. Pointer-events disabled so it doesn't steal hover from the
          canvas. */}
      {tooltipVisible && hoveredNode && (
        <div ref={tooltipRef} className={`graph-tooltip ${isStatusNode(hoveredNode) ? 'graph-tooltip-status' : 'graph-tooltip-simple'}`}>
          {isStatusNode(hoveredNode) ? (
            <>
              <div className="graph-tooltip-header">
                <div className="graph-tooltip-category">
                  {getCategoryIcon(hoveredNode)}
                  <span className="graph-tooltip-cat-label">{getCategoryLabel(hoveredNode)}</span>
                </div>
                <span className={`graph-tooltip-badge ${getStatusBadge(hoveredNode).cls}`}>
                  {getStatusBadge(hoveredNode).label}
                </span>
              </div>
              <div className="graph-tooltip-content">
                <div className="graph-tooltip-title">{hoveredNode.label}</div>
                {hoveredNode.tooltip && (
                  <div className="graph-tooltip-body">{hoveredNode.tooltip}</div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="graph-tooltip-category">
                {getCategoryIcon(hoveredNode)}
                <span className="graph-tooltip-cat-label">{getCategoryLabel(hoveredNode)}</span>
              </div>
              <div className="graph-tooltip-content">
                <div className="graph-tooltip-title">{hoveredNode.label}</div>
                {hoveredNode.tooltip && (
                  <div className="graph-tooltip-body">{hoveredNode.tooltip}</div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Selection popover — shows when any node is clicked. */}
      <AnimatePresence>
        {selectionPopoverVisible && selectedNode && (
          <div ref={selectionRef} className="graph-popover-anchor">
            <SelectionPopover
              key={`selection-${selectedNode.id}`}
              node={selectedNode}
              onSeeTask={() => onSeeTask?.(selectedNode)}
              onAskNous={(node, question) => {
                setSelectedId(null)
                onAskNous?.(node, question)
              }}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Approval popover — centered on the canvas for visibility. */}
      <AnimatePresence>
        {approvalPending && popoverOpen && (
          <div className="graph-approval-center">
            <ApprovalPopover
              key="approval-popover"
              onApprove={onApprove}
              onInvestigate={onInvestigate}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
