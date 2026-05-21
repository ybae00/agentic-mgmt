import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/Sidebar.jsx'
import PromptBar from './components/PromptBar.jsx'
import ChatPanel from './components/ChatPanel.jsx'
import NodeGraph from './components/NodeGraph.jsx'
import InvestigatePanel from './components/InvestigatePanel.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import Onboarding, { isOnboardingComplete } from './components/Onboarding.jsx'
import { useDemoRunner } from './hooks/useDemoRunner.js'
import { useRealAgent } from './hooks/useRealAgent.js'
import { PROMPT_HINT, INITIAL_RESPONSE, FINAL_RESPONSE } from './data/demoScript.js'
import {
  SESSIONS,
  DEFAULT_SESSION_ORDER,
  POST_SUBMIT_SESSION_ORDER,
} from './data/sessions.js'
import './App.css'

const APPROVAL_NODE_ID = 'cad-approval'

export default function App() {
  const [mode, setMode] = useState('demo')
  const [submitted, setSubmitted] = useState(false)
  const [submittedPrompt, setSubmittedPrompt] = useState('')
  const [thinking, setThinking] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [investigation, setInvestigation] = useState(null)
  const [activeSessionId, setActiveSessionId] = useState('new')
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false)
  const [dynamicSessions, setDynamicSessions] = useState([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sessionCounter, setSessionCounter] = useState(0)
  const [onboarding, setOnboarding] = useState(!isOnboardingComplete())
  const [askNousData, setAskNousData] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [chatFolded, setChatFolded] = useState(false)

  // --- Demo runner (only active in demo mode) ---
  const demoRunner = useDemoRunner({
    active: mode === 'demo' && submitted,
    onFinalResponse: () => {
      setThinking(true)
      setTimeout(() => {
        setThinking(false)
        setResponseText(FINAL_RESPONSE)
      }, 500)
    },
  })

  // --- Real agent (only active in real mode) ---
  const realAgent = useRealAgent({
    active: mode === 'real' && submitted,
    prompt: mode === 'real' && submitted ? submittedPrompt : null,
  })

  // Unified interface based on mode
  const states = mode === 'demo' ? demoRunner.states : realAgent.states
  const approvalPending =
    mode === 'demo' ? demoRunner.approvalPending : realAgent.approvalPending
  const approve = mode === 'demo' ? demoRunner.approve : realAgent.approve

  const currentThinking =
    mode === 'demo' ? thinking : realAgent.thinking
  const currentResponseText =
    mode === 'demo'
      ? responseText
      : realAgent.finalResponseText || realAgent.responseText

  // Build a real-time session from agent-generated nodes
  const realSession = useMemo(
    () => ({
      id: 'real-session',
      label: submittedPrompt
        ? submittedPrompt.slice(0, 40) + (submittedPrompt.length > 40 ? '…' : '')
        : 'AI Session',
      meta: 'now',
      kind: 'demo',
      nodes: realAgent.nodes,
    }),
    [realAgent.nodes, submittedPrompt],
  )

  const sessions = useMemo(() => {
    const order = hasSubmittedOnce
      ? POST_SUBMIT_SESSION_ORDER
      : DEFAULT_SESSION_ORDER
    const ids = order.filter((id) => id !== 'new')

    let topEntry = []
    if (mode === 'real' && submitted) {
      topEntry = [
        {
          ...realSession,
          active: activeSessionId === 'real-session',
        },
      ]
    } else if (ids.includes('falcon9')) {
      topEntry = [
        {
          ...SESSIONS.falcon9,
          active: 'falcon9' === activeSessionId,
        },
      ]
    }

    const dynamicList = dynamicSessions.map((s) => ({
      ...s,
      active: s.id === activeSessionId,
    }))
    const historyList = ids
      .filter((id) => id !== 'falcon9')
      .map((id) => ({
        ...SESSIONS[id],
        active: id === activeSessionId,
      }))
    return [...topEntry, ...dynamicList, ...historyList]
  }, [
    hasSubmittedOnce,
    activeSessionId,
    dynamicSessions,
    mode,
    submitted,
    realSession,
  ])

  const activeSession =
    mode === 'real' && submitted && activeSessionId === 'real-session'
      ? realSession
      : SESSIONS[activeSessionId] ??
        dynamicSessions.find((s) => s.id === activeSessionId) ??
        SESSIONS.new

  function handleSubmit(text) {
    if (submitted) return
    const promptText = text || PROMPT_HINT
    setSubmittedPrompt(promptText)
    setSubmitted(true)
    setHasSubmittedOnce(true)
    setChatOpen(true)

    if (mode === 'demo') {
      setActiveSessionId('falcon9')
      setThinking(true)
      setTimeout(() => {
        setThinking(false)
        setResponseText(INITIAL_RESPONSE)
      }, 700)
    } else {
      setActiveSessionId('real-session')
    }
  }

  function handleSelectSession(id) {
    if (id === activeSessionId) return
    setActiveSessionId(id)
    if (id !== 'falcon9' && id !== 'real-session') setInvestigation(null)
  }

  function handleNewSession() {
    const count = sessionCounter + 1
    setSessionCounter(count)
    const now = new Date()
    const id = `session-${count}-${Date.now()}`
    const newSession = {
      id,
      label: 'New session',
      meta: 'now',
      date:
        now
          .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
          .replace(/ /g, ' ') +
        ', ' +
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      kind: 'empty',
      nodes: [],
    }
    setDynamicSessions((prev) => [newSession, ...prev])
    setInvestigation(null)
    setActiveSessionId(id)
  }

  function handleInvestigate() {
    if (mode === 'demo') {
      const approvalNode = SESSIONS.falcon9.nodes.find(
        (n) => n.id === APPROVAL_NODE_ID,
      )
      setInvestigation({ node: approvalNode, isApprovalContext: true })
    } else {
      const approvalNode = realAgent.nodes.find(
        (n) => states[n.id] === 'needs-approval',
      )
      if (approvalNode) {
        setInvestigation({ node: approvalNode, isApprovalContext: true })
      }
    }
  }

  function handleSeeTask(node) {
    setInvestigation({ node, isApprovalContext: false })
  }

  function handleAskNous(node, question) {
    setAskNousData({ node, question })
    setChatOpen(true)
    setInvestigation(null)
  }

  function handleApproveFromInvestigate() {
    setInvestigation(null)
    setTimeout(approve, 350)
  }

  function handleModeChange(newMode) {
    if (newMode === mode) return
    setMode(newMode)
    // Reset state when switching modes
    setSubmitted(false)
    setSubmittedPrompt('')
    setThinking(false)
    setResponseText('')
    setInvestigation(null)
    setActiveSessionId('new')
    setChatOpen(false)
    setChatFolded(false)
    setAskNousData(null)
  }

  const isFalcon9 = activeSessionId === 'falcon9'
  const isRealSession = activeSessionId === 'real-session'
  const showGraph = activeSession.kind !== 'empty'

  const effectiveApprovalNodeId =
    mode === 'demo'
      ? APPROVAL_NODE_ID
      : realAgent.nodes.find((n) => states[n.id] === 'needs-approval')?.id

  return (
    <div className="canvas">
      {onboarding && (
        <Onboarding onComplete={() => setOnboarding(false)} />
      )}

      <Sidebar
        sessions={sessions}
        onSelect={handleSelectSession}
        onNewSession={handleNewSession}
        onSettings={() => setSettingsOpen(true)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      {showGraph && (
        <NodeGraph
          session={activeSession}
          runtimeStates={states}
          approvalPending={
            (isFalcon9 || isRealSession) &&
            approvalPending &&
            !investigation
          }
          approvalNodeId={effectiveApprovalNodeId}
          compressed={!!investigation}
          sidebarCollapsed={sidebarCollapsed}
          chatFolded={chatFolded}
          onApprove={approve}
          onInvestigate={handleInvestigate}
          onSeeTask={handleSeeTask}
          onAskNous={handleAskNous}
        />
      )}

      <AnimatePresence>
        {chatOpen && !investigation && !chatFolded && (
          <ChatPanel
            key="chat-panel"
            mode={mode}
            taskName={
              mode === 'demo'
                ? 'Falcon 9 Review'
                : submittedPrompt.slice(0, 30) || 'AI Task'
            }
            promptText={mode === 'demo' ? PROMPT_HINT : submittedPrompt}
            responseText={currentResponseText}
            thinking={currentThinking}
            askNousData={askNousData}
            onAskNousConsumed={() => setAskNousData(null)}
            askNousFn={mode === 'real' ? realAgent.askNous : null}
            onFold={() => setChatFolded(true)}
          />
        )}
      </AnimatePresence>

      {chatOpen && !investigation && chatFolded && (
        <button
          className="chat-unfold-btn"
          type="button"
          aria-label="Expand chat panel"
          onClick={() => setChatFolded(false)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      <AnimatePresence>
        {!submitted && (
          <PromptBar
            key="prompt-bar"
            submitted={false}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {investigation && (
          <InvestigatePanel
            key="investigate"
            mode={mode}
            node={investigation.node}
            isApprovalContext={investigation.isApprovalContext}
            onClose={() => setInvestigation(null)}
            onApprove={handleApproveFromInvestigate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {settingsOpen && (
          <SettingsPanel
            key="settings"
            mode={mode}
            onModeChange={handleModeChange}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
