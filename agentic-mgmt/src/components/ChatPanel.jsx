import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import rightFoldIcon from '../assets/icons/right-fold.svg'
import greyAddIcon from '../assets/icons/grey-add.svg'
import fileIcon from '../assets/icons/file.svg'
import sendIcon from '../assets/icons/send.svg'
import './ChatPanel.css'

const SLIDE_DURATION = 0.6
const FADE_DELAY = SLIDE_DURATION + 0.05

const dissolve = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.35, delay: FADE_DELAY, ease: 'easeOut' },
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
    <svg viewBox="0 0 256 255" className="chat-node-icon">
      <defs>
        <linearGradient id="chatPyBlue" x1="12.96%" y1="12.07%" x2="79.64%" y2="78.8%">
          <stop offset="0%" stopColor="#387EB8"/><stop offset="100%" stopColor="#366994"/>
        </linearGradient>
        <linearGradient id="chatPyYellow" x1="19.13%" y1="20.58%" x2="90.43%" y2="88.01%">
          <stop offset="0%" stopColor="#FFC836"/><stop offset="100%" stopColor="#FFD43B"/>
        </linearGradient>
      </defs>
      <path d="M126.9 0C62.7 0 66.7 27.6 66.7 27.6l.1 28.6h61.3v8.6H39.2S0 60.7 0 126.2c0 65.5 34.2 63.2 34.2 63.2h20.4v-30.4s-1.1-34.2 33.7-34.2h58c32.3 0 34-33.1 34-33.1V33.1S184.3 0 126.9 0zM92.3 19.1a11 11 0 110 22 11 11 0 010-22z" fill="url(#chatPyBlue)"/>
      <path d="M128.8 254.1c64.2 0 60.2-27.6 60.2-27.6l-.1-28.6h-61.3v-8.6h88.9s39.2 4.1 39.2-61.4c0-65.5-34.2-63.2-34.2-63.2h-20.4v30.4s1.1 34.2-33.7 34.2h-58c-32.3 0-34 33.1-34 33.1v58.7s-5.2 33-60.2 33zm34.6-19.1a11 11 0 110-22 11 11 0 010 22z" fill="url(#chatPyYellow)"/>
    </svg>
  ),
  cad: (
    <svg viewBox="0 0 24 24" className="chat-node-icon">
      <rect width="24" height="24" rx="4" fill="#D42B2B"/>
      <path d="M7 17L12 5l5 12h-2.4l-1-2.8H10.4L9.4 17H7zm4-4.6h2l-1-2.8-1 2.8z" fill="#fff"/>
    </svg>
  ),
  docs: (
    <svg viewBox="0 0 24 24" fill="none" className="chat-node-icon">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#4285F4"/>
      <path d="M14 2v6h6" fill="#A1C2FA"/>
      <path d="M8 13h8M8 17h5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  root: (
    <svg viewBox="0 0 24 24" fill="none" className="chat-node-icon">
      <circle cx="12" cy="12" r="10" fill="#888"/>
      <path d="M12 8v4l3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  final: (
    <svg viewBox="0 0 24 24" fill="none" className="chat-node-icon">
      <circle cx="12" cy="12" r="10" fill="#2a9d6f"/>
      <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

const PRESTAGED_ANSWERS = {
  'cad-1': 'I opened the Falcon 9 master assembly (FA9-ASSY-001 rev 12) in AutoCAD and loaded all 847 sub-components. The file was last modified 3 days ago — no unexpected changes since the last review cycle.',
  'cad-2': 'I isolated the Merlin 1D thruster sub-assembly and loaded the detailed geometry. Cross-checked the part tree against the BOM — all 34 components present and accounted for.',
  'cad-3': 'I swept the gimbal through its full ±5° range and measured clearances against the engine bay walls. Minimum clearance was 14.2 mm at full deflection — well above the 8 mm minimum in the design spec.',
  'cad-4': 'I measured the nozzle exit plane radius at 8 evenly-spaced points. Average was 0.921 m with ±0.3 mm variation. This matches the design doc spec of 0.92 m within tolerance.',
  'cad-approval': 'While inspecting the thrust chamber, I measured the wall thickness at 2.1 mm. The design spec (§3.4.2) requires a minimum of 2.5 mm for structural margin during max-Q. This is a 16% shortfall — I flagged it for your approval before making changes, since updating the geometry will shift the mass budget by approximately 0.8 kg.',
  'cad-5': 'After your approval, I updated the thrust chamber wall thickness from 2.1 mm to 2.5 mm across all 12 affected surfaces. The mass delta was +0.74 kg, which I logged in the mass properties tracker.',
  'cad-6': 'I regenerated the FEA mesh with the updated geometry — 142,000 tetrahedral elements, average quality 0.94. Ran a quick stress check: peak von Mises stress dropped from 312 MPa to 248 MPa, now well within the 280 MPa allowable.',
  'cad-7': 'CAD review is complete. Summary: gimbal clearances nominal, nozzle radius on-spec, thrust chamber wall corrected from 2.1 → 2.5 mm. One geometry change made, mass budget updated. All checks pass.',
  'sim-1': 'I loaded thrust_sim.py (rev 7) and verified all dependencies — NumPy 1.24, SciPy 1.11, and the internal propulsion library v3.2. The simulation environment is configured for sea-level conditions (101.325 kPa, 288.15 K).',
  'sim-2': 'I pulled the LOX/RP-1 propellant parameters from the certified constants database: LOX density 1141 kg/m³, RP-1 density 820 kg/m³, O/F ratio 2.36. All values match the propulsion spec rev 4.',
  'sim-3': 'I ran the specific impulse calculation using the CEA equilibrium model. Result: 282.3 s at sea level, 311.2 s in vacuum. Both are within 0.5% of the certified Merlin 1D performance spec.',
  'sim-4': 'I modeled chamber pressure from ignition through MECO across 3 throttle profiles (100%, 80%, 65%). Peak chamber pressure was 97.2 bar at full thrust — within the 100 bar design limit. Pressure stability margin is 2.8 bar.',
  'sim-5': 'The full thrust simulation completed nominally. Key results: 854 kN sea-level thrust, 282 s Isp, 97.2 bar peak chamber pressure. All parameters within spec. No anomalies detected across 14 test cases.',
  'docs-1': 'I opened design_spec_v4.docx (last saved 5 days ago by the systems team). The document has 12 sections, 47 pages, and references 23 CAD drawings. I verified the file integrity — no corruption detected.',
  'docs-2': 'I diffed revisions 4.0, 3.2, and 3.1. Found 3 sections where CAD reference numbers drifted from the current model: §4.2 (thrust chamber dims), §6.1 (nozzle assembly), and §8.3 (gimbal actuator). The performance specs in §5 were unchanged.',
  'docs-3': 'I updated 7 CAD part numbers across 3 sections to match the current model. Specifically: TC-ASSY-004 → TC-ASSY-006 in §4.2, NOZ-DWG-011 → NOZ-DWG-013 in §6.1, and 4 actuator references in §8.3. All cross-references verified.',
  'docs-4': 'Documentation sync is complete. The design spec is now rev 4.1 with all CAD references current. Change log updated with today\'s date and a summary of the 7 part number corrections.',
  'root': 'I kicked off the Falcon 9 review session and initiated three parallel work streams: CAD geometry inspection, thrust simulation verification, and documentation cross-check. All three branches are running concurrently to minimize total review time.',
  'final': 'All three review branches are complete. CAD: one geometry fix (wall thickness 2.1 → 2.5 mm, approved). Simulation: all nominal (854 kN thrust, 282 s Isp). Docs: 7 part numbers updated, now on rev 4.1. No outstanding issues.',
}

function generateResponse(node) {
  return PRESTAGED_ANSWERS[node.id] || `This step handled "${node.label}". ${node.tooltip || ''} Everything completed as expected — no issues found.`
}

export default function ChatPanel({
  taskName, promptText, responseText, thinking,
  askNousData, onAskNousConsumed,
}) {
  const [tabs, setTabs] = useState([
    { id: 1, name: taskName || 'New task', prompt: promptText, isNew: false },
  ])
  const [activeTabId, setActiveTabId] = useState(1)
  const [tabCounter, setTabCounter] = useState(1)
  const [input, setInput] = useState('')
  const [askNousThinking, setAskNousThinking] = useState(false)
  const [askNousResponse, setAskNousResponse] = useState(null)

  const isFirstLoad = useRef(true)
  const activeTab = tabs.find((t) => t.id === activeTabId)
  const isNewChat = activeTab?.isNew
  const isAskNousTab = activeTab?.askNous != null

  const askTimerRef = useRef(null)

  useEffect(() => {
    if (!askNousData) return
    const node = askNousData.node
    const next = tabCounter + 1
    setTabCounter(next)
    const newTab = {
      id: next,
      name: node.label,
      prompt: askNousData.question,
      askNous: node,
      isNew: false,
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(next)
    setInput('')
    setAskNousThinking(true)
    setAskNousResponse(null)

    if (askTimerRef.current) clearTimeout(askTimerRef.current)
    askTimerRef.current = setTimeout(() => {
      setAskNousThinking(false)
      setAskNousResponse(generateResponse(node))
      askTimerRef.current = null
    }, 1200)

    onAskNousConsumed?.()
  }, [askNousData])

  function handleAddTab() {
    const next = tabCounter + 1
    setTabCounter(next)
    const newTab = { id: next, name: 'New chat', prompt: '', isNew: true }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(next)
    setInput('')
  }

  function handleSelectTab(id) {
    setActiveTabId(id)
    setInput('')
  }

  const hasInput = input.trim().length > 0
  const isMainTab = activeTabId === 1

  const nodeForCard = activeTab?.askNous
  const isStatus = nodeForCard?.branch === 'sim'
  const category = nodeForCard ? (BRANCH_CATEGORIES[nodeForCard.branch] || nodeForCard.branch) : null
  const icon = nodeForCard ? (BRANCH_ICONS[nodeForCard.branch] || BRANCH_ICONS.root) : null

  function getBadge(node) {
    if (node.state === 'complete') return { label: 'Nominal', cls: 'chat-badge-nominal' }
    if (node.state === 'active') return { label: 'Running', cls: 'chat-badge-running' }
    if (node.state === 'needs-approval') return { label: 'Pending', cls: 'chat-badge-pending' }
    return { label: 'Nominal', cls: 'chat-badge-nominal' }
  }

  const currentThinking = isMainTab ? thinking : (isAskNousTab && askNousThinking)
  const currentResponse = isMainTab ? responseText : (isAskNousTab ? askNousResponse : null)

  return (
    <motion.div
      className={`chat-panel ${isNewChat ? 'compact' : ''}`}
      initial={{
        background: 'rgba(255,255,255,0)',
        borderColor: 'rgba(228,228,228,0)',
      }}
      animate={{
        background: 'rgba(255,255,255,1)',
        borderColor: 'rgba(228,228,228,1)',
      }}
      exit={{ opacity: 0, x: 40 }}
      transition={{
        duration: 0.35,
        delay: isNewChat ? 0 : FADE_DELAY,
        ease: 'easeOut',
      }}
    >
      {/* Header */}
      <motion.div className="chat-header" {...(isNewChat ? {} : dissolve)}>
        <span className="chat-title">Tasks</span>
        <button className="chat-iconbtn" type="button" aria-label="Fold panel">
          <img src={rightFoldIcon} alt="" />
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div className="chat-tabs-row" {...(isNewChat ? {} : dissolve)}>
        <div className="chat-tabs">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`chat-tab ${tab.id === activeTabId ? 'active' : ''}`}
              onClick={() => handleSelectTab(tab.id)}
            >
              <span>{tab.name}</span>
            </div>
          ))}
        </div>
        <button className="chat-iconbtn" type="button" aria-label="Add chat" onClick={handleAddTab}>
          <img src={greyAddIcon} alt="" />
        </button>
      </motion.div>

      {/* Content area */}
      {!isNewChat && (
        <motion.div
          className="chat-content"
          key={activeTabId}
          initial={isFirstLoad.current
            ? { x: -200, y: 180, opacity: 1 }
            : { y: 20, opacity: 0 }
          }
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={isFirstLoad.current
            ? { duration: SLIDE_DURATION, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0.3, ease: 'easeOut' }
          }
          onAnimationComplete={() => { isFirstLoad.current = false }}
        >
          {/* Node context card — for Ask Nous tabs */}
          {nodeForCard && (
            <div className="chat-node-card">
              {isStatus ? (
                <div className="chat-node-header">
                  <div className="chat-node-category">
                    {icon}
                    <span className="chat-node-cat-label">{category}</span>
                  </div>
                  <span className={`chat-node-badge ${getBadge(nodeForCard).cls}`}>
                    {getBadge(nodeForCard).label}
                  </span>
                </div>
              ) : (
                <div className="chat-node-category">
                  {icon}
                  <span className="chat-node-cat-label">{category}</span>
                </div>
              )}
              <div className="chat-node-content">
                <div className="chat-node-title">{nodeForCard.label}</div>
                {nodeForCard.tooltip && (
                  <div className="chat-node-body">{nodeForCard.tooltip}</div>
                )}
              </div>
            </div>
          )}

          {/* User prompt */}
          <div className="chat-prompt-box">
            <p className="chat-prompt-text">{activeTab?.prompt || promptText}</p>
          </div>

          {/* Agent response */}
          <div className="chat-response">
            {currentThinking ? (
              <motion.div
                className="chat-thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: isFirstLoad.current ? FADE_DELAY : 0.15 }}
              >
                <span className="chat-thinking-dot" />
                <span className="chat-thinking-dot" />
                <span className="chat-thinking-dot" />
              </motion.div>
            ) : (
              currentResponse && (
                <motion.p
                  className="chat-response-text"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.04,
                        delayChildren: isFirstLoad.current ? FADE_DELAY + 0.1 : 0.15,
                      },
                    },
                  }}
                >
                  {currentResponse.split(/(\s+)/).map((w, i) => (
                    <motion.span
                      key={`${i}-${w}`}
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: { duration: 0.3, ease: 'easeOut' },
                        },
                      }}
                    >
                      {w}
                    </motion.span>
                  ))}
                </motion.p>
              )
            )}
          </div>
        </motion.div>
      )}

      {/* Bottom input */}
      <motion.div
        className="chat-input-box"
        {...(isNewChat ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.35, delay: FADE_DELAY + 0.05, ease: 'easeOut' } })}
      >
        <input
          className="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Plan, leave comment, or tag @nous"
        />
        <div className="chat-input-actions">
          <button className="chat-iconbtn" type="button" aria-label="Attach file">
            <img src={fileIcon} alt="" />
          </button>
          <button className={`chat-sendbtn ${hasInput ? 'active' : ''}`} type="button" aria-label="Send">
            <img src={sendIcon} alt="" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
