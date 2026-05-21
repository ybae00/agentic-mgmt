import { useRef, useMemo, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  OrbitControls,
  Grid,
  Environment,
  Html,
  Line,
  Edges,
} from '@react-three/drei'
import * as THREE from 'three'

const NOZZLE_COLOR = '#6699cc'
const NOZZLE_HIGHLIGHT = '#e05454'
const WIREFRAME_COLOR = '#4a9eff'

function buildNozzleProfile() {
  const pts = []
  const chamberR = 1.2
  const throatR = 0.55
  const exitR = 1.8
  const chamberLen = 1.8
  const convergentLen = 1.0
  const divergentLen = 2.6
  const steps = 48

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    let x, y
    if (t < 0.35) {
      const s = t / 0.35
      x = -chamberLen + s * chamberLen
      y = chamberR
    } else if (t < 0.55) {
      const s = (t - 0.35) / 0.2
      x = s * convergentLen
      const blend = Math.pow(s, 1.5)
      y = chamberR + (throatR - chamberR) * blend
    } else {
      const s = (t - 0.55) / 0.45
      x = convergentLen + s * divergentLen
      const bellT = 1 - Math.pow(1 - s, 2.2)
      y = throatR + (exitR - throatR) * bellT
    }
    pts.push(new THREE.Vector2(y, x))
  }
  return pts
}

function buildInnerProfile() {
  const outer = buildNozzleProfile()
  const wallThickness = 0.08
  return outer.map(
    (p) => new THREE.Vector2(Math.max(0.02, p.x - wallThickness), p.y)
  )
}

function NozzleModel({ highlight }) {
  const groupRef = useRef()
  const outerProfile = useMemo(() => buildNozzleProfile(), [])
  const innerProfile = useMemo(() => buildInnerProfile(), [])

  const outerGeo = useMemo(
    () => new THREE.LatheGeometry(outerProfile, 64),
    [outerProfile]
  )
  const innerGeo = useMemo(
    () => new THREE.LatheGeometry(innerProfile, 64),
    [innerProfile]
  )

  const highlightGeo = useMemo(() => {
    if (!highlight) return null
    const pts = []
    const outer = buildNozzleProfile()
    for (let i = 0; i < outer.length; i++) {
      const p = outer[i]
      if (p.y >= -1.2 && p.y <= 0.2) pts.push(p)
    }
    if (pts.length < 3) return null
    return new THREE.LatheGeometry(pts, 64)
  }, [highlight])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08
    }
  })

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 2]} position={[0.4, 0, 0]}>
      <mesh geometry={outerGeo}>
        <meshPhysicalMaterial
          color={NOZZLE_COLOR}
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <lineSegments>
        <wireframeGeometry args={[outerGeo]} />
        <lineBasicMaterial color={WIREFRAME_COLOR} transparent opacity={0.07} />
      </lineSegments>

      <mesh geometry={outerGeo}>
        <meshBasicMaterial visible={false} />
        <Edges threshold={18} color={WIREFRAME_COLOR} linewidth={1} scale={1} />
      </mesh>

      <mesh geometry={innerGeo}>
        <meshPhysicalMaterial
          color="#88aacc"
          metalness={0.5}
          roughness={0.4}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>

      {highlight && highlightGeo && (
        <>
          <mesh geometry={highlightGeo}>
            <meshPhysicalMaterial
              color={NOZZLE_HIGHLIGHT}
              metalness={0.4}
              roughness={0.3}
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
              emissive={NOZZLE_HIGHLIGHT}
              emissiveIntensity={0.3}
            />
          </mesh>
          <lineSegments>
            <wireframeGeometry args={[highlightGeo]} />
            <lineBasicMaterial
              color={NOZZLE_HIGHLIGHT}
              transparent
              opacity={0.15}
            />
          </lineSegments>
        </>
      )}

      {highlight && (
        <DimensionAnnotation />
      )}
    </group>
  )
}

function DimensionAnnotation() {
  const leaderPts = useMemo(
    () => [
      [0, 1.22, 0],
      [0, 1.8, 0],
      [0.6, 2.0, 0],
    ],
    []
  )
  return (
    <group>
      <Line
        points={leaderPts}
        color={NOZZLE_HIGHLIGHT}
        lineWidth={1.5}
        dashed={false}
      />
      <mesh position={[0, 1.22, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial color={NOZZLE_HIGHLIGHT} />
      </mesh>
    </group>
  )
}

function CadGrid() {
  return (
    <>
      <Grid
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#1a3050"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#2a4a70"
        fadeDistance={14}
        fadeStrength={1.2}
        infiniteGrid
        position={[0, -2.2, 0]}
      />
      <axesHelper args={[1.5]} position={[-3.5, -2.2, -3.5]} />
    </>
  )
}

function CameraRig() {
  const { camera } = useThree()
  const initialized = useRef(false)
  useFrame(() => {
    if (!initialized.current) {
      camera.position.set(4.5, 2.5, 4.5)
      camera.lookAt(0, 0, 0)
      initialized.current = true
    }
  })
  return null
}

function Viewport3D({ highlight }) {
  return (
    <Canvas
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      camera={{ fov: 35, near: 0.1, far: 100, position: [4.5, 2.5, 4.5] }}
      style={{ background: 'transparent' }}
    >
      <CameraRig />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.0} color="#e8f0ff" />
      <directionalLight position={[-3, 4, -5]} intensity={0.4} color="#aaccff" />
      <pointLight position={[0, 4, 0]} intensity={0.5} color="#ffffff" />

      <NozzleModel highlight={highlight} />
      <CadGrid />

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={3}
        maxDistance={15}
        enablePan
        panSpeed={0.5}
        rotateSpeed={0.6}
      />
    </Canvas>
  )
}

// ---------------------------------------------------------------------------
// 2D UI overlays
// ---------------------------------------------------------------------------

const TREE_ITEMS = [
  { id: 'root', label: 'Falcon 9 Assembly', depth: 0, icon: 'asm' },
  { id: 'bay', label: 'Thruster Bay', depth: 1, icon: 'grp' },
  { id: 'chamber', label: 'thrust_chamber_v4', depth: 2, icon: 'part', flagged: true },
  { id: 'nozzle', label: 'nozzle_bell', depth: 2, icon: 'part' },
  { id: 'gimbal', label: 'gimbal_mount', depth: 2, icon: 'part' },
  { id: 'inj', label: 'injector_plate', depth: 2, icon: 'part' },
  { id: 'cool', label: 'cooling_jacket', depth: 2, icon: 'part' },
  { id: 'bolt', label: 'flange_bolts (x24)', depth: 2, icon: 'hw' },
  { id: 'ox', label: 'Oxidizer Feed', depth: 1, icon: 'grp' },
  { id: 'valve', label: 'main_ox_valve', depth: 2, icon: 'part' },
  { id: 'fuel', label: 'Fuel Feed', depth: 1, icon: 'grp' },
  { id: 'rp1', label: 'rp1_manifold', depth: 2, icon: 'part' },
]

function TreeIcon({ icon }) {
  if (icon === 'asm') return <span className="cad3d-tree-icon cad3d-tree-icon-asm">◆</span>
  if (icon === 'grp') return <span className="cad3d-tree-icon cad3d-tree-icon-grp">▸</span>
  if (icon === 'hw') return <span className="cad3d-tree-icon cad3d-tree-icon-hw">⬡</span>
  return <span className="cad3d-tree-icon cad3d-tree-icon-part">◇</span>
}

function ModelTree({ highlight }) {
  return (
    <div className="cad3d-sidebar">
      <div className="cad3d-sidebar-header">
        <span className="cad3d-sidebar-title">Model Tree</span>
      </div>
      <div className="cad3d-tree-scroll">
        {TREE_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`cad3d-tree-item ${highlight && item.flagged ? 'flagged' : ''} ${
              item.id === 'chamber' ? 'selected' : ''
            }`}
            style={{ paddingLeft: 8 + item.depth * 12 }}
          >
            <TreeIcon icon={item.icon} />
            <span className="cad3d-tree-label">{item.label}</span>
            {highlight && item.flagged && <span className="cad3d-tree-badge">!</span>}
          </div>
        ))}
      </div>
      <div className="cad3d-sidebar-footer">
        <span>12 parts</span>
        <span>3 groups</span>
      </div>
    </div>
  )
}

const TOOLS = [
  { id: 'select', label: 'Select', icon: '⊹' },
  { id: 'pan', label: 'Pan', icon: '✥' },
  { id: 'zoom', label: 'Zoom', icon: '⊕' },
  { id: 'rotate', label: 'Rotate', icon: '↻' },
  { id: 'sep1', label: '', icon: '' },
  { id: 'measure', label: 'Measure', icon: '⊿' },
  { id: 'section', label: 'Section', icon: '⊘' },
  { id: 'wireframe', label: 'Wireframe', icon: '◇' },
]

function Toolbar() {
  const [active, setActive] = useState('rotate')
  return (
    <div className="cad3d-toolbar">
      {TOOLS.map((t) =>
        t.id.startsWith('sep') ? (
          <div key={t.id} className="cad3d-toolbar-sep" />
        ) : (
          <button
            key={t.id}
            className={`cad3d-toolbar-btn ${active === t.id ? 'active' : ''}`}
            title={t.label}
            onClick={() => setActive(t.id)}
          >
            {t.icon}
          </button>
        )
      )}

      <div className="cad3d-toolbar-spacer" />

      <div className="cad3d-toolbar-views">
        <button className="cad3d-toolbar-view" title="Front">F</button>
        <button className="cad3d-toolbar-view" title="Top">T</button>
        <button className="cad3d-toolbar-view" title="Right">R</button>
        <button className="cad3d-toolbar-view active" title="Isometric">ISO</button>
      </div>
    </div>
  )
}

function StatusBar() {
  return (
    <div className="cad3d-statusbar">
      <span className="cad3d-status-item">
        <span className="cad3d-status-label">Model:</span> falcon9_thruster.fcstd
      </span>
      <span className="cad3d-status-sep">|</span>
      <span className="cad3d-status-item">
        <span className="cad3d-status-label">Units:</span> mm
      </span>
      <span className="cad3d-status-sep">|</span>
      <span className="cad3d-status-item">
        <span className="cad3d-status-label">Faces:</span> 12,482
      </span>
      <span className="cad3d-status-sep">|</span>
      <span className="cad3d-status-item">
        <span className="cad3d-status-label">Verts:</span> 6,344
      </span>
      <span className="cad3d-status-spacer" />
      <span className="cad3d-status-item cad3d-status-coords">
        X: 0.00 &nbsp; Y: 0.00 &nbsp; Z: 0.00
      </span>
    </div>
  )
}

function PropertiesPanel({ highlight }) {
  return (
    <div className="cad3d-properties">
      <div className="cad3d-prop-header">Properties</div>
      <div className="cad3d-prop-body">
        <div className="cad3d-prop-row">
          <span className="cad3d-prop-key">Part</span>
          <span className="cad3d-prop-val">thrust_chamber_v4</span>
        </div>
        <div className="cad3d-prop-row">
          <span className="cad3d-prop-key">Material</span>
          <span className="cad3d-prop-val">Inconel 718</span>
        </div>
        <div className="cad3d-prop-row">
          <span className="cad3d-prop-key">Mass</span>
          <span className="cad3d-prop-val">48.2 kg</span>
        </div>
        <div className={`cad3d-prop-row ${highlight ? 'cad3d-prop-flagged' : ''}`}>
          <span className="cad3d-prop-key">Wall min</span>
          <span className="cad3d-prop-val">
            {highlight ? '2.1 mm' : '2.5 mm'}
            {highlight && <span className="cad3d-prop-warn"> ▼ below 2.5 mm</span>}
          </span>
        </div>
        <div className="cad3d-prop-row">
          <span className="cad3d-prop-key">Revision</span>
          <span className="cad3d-prop-val">v4.1</span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Exported CadView
// ---------------------------------------------------------------------------

export default function CadView3D({ highlight }) {
  return (
    <div className="cad3d">
      <Toolbar />
      <div className="cad3d-main">
        <ModelTree highlight={highlight} />
        <div className="cad3d-viewport-wrap">
          <div className="cad3d-viewport-bg" />
          <Viewport3D highlight={highlight} />

          {highlight && (
            <div className="cad3d-callout">
              <div className="cad3d-callout-pulse" />
              <div className="cad3d-callout-body">
                <div className="cad3d-callout-label">Chamber Wall Thickness</div>
                <div className="cad3d-callout-value">
                  2.1 mm <span className="cad3d-callout-spec">/ 2.5 mm min</span>
                </div>
                <div className="cad3d-callout-note">
                  Flagged by agent — below MMP-FAL-013 spec
                </div>
              </div>
            </div>
          )}

          <div className="cad3d-view-cube">
            <span>ISO</span>
          </div>
        </div>
        <PropertiesPanel highlight={highlight} />
      </div>
      <StatusBar />
    </div>
  )
}
