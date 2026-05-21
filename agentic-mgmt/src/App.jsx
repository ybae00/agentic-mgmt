import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar.jsx'
import PromptBar from './components/PromptBar.jsx'
import ChatPanel from './components/ChatPanel.jsx'
import NodeGraph from './components/NodeGraph.jsx'
import InvestigatePanel from './components/InvestigatePanel.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import Onboarding, { isOnboardingComplete } from './components/Onboarding.jsx'
import { useDemoRunner } from './hooks/useDemoRunner.js'
import { PROMPT_HINT, INITIAL_RESPONSE, FINAL_RESPONSE } from './data/demoScript.js'
import {
  SESSIONS,
  DEFAULT_SESSION_ORDER,
  POST_SUBMIT_SESSION_ORDER,
} from './data/sessions.js'
import './App.css'

const APPROVAL_NODE_ID = 'cad-approval'

export default function App() {
  const [submitted, setSubmitted] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [responseText, setResponseText] = useState('')
  // When set, the desktop view slides in. The object holds the node we're
  // looking at + whether this is the approval flow (which shows the
  // "Approve fix" button instead of just "Close").
  const [investigation, setInvestigation] = useState(null)
  const [activeSessionId, setActiveSessionId] = useState('new')
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false)
  const [dynamicSessions, setDynamicSessions] = useState([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sessionCounter, setSessionCounter] = useState(0)
  const [onboarding, setOnboarding] = useState(!isOnboardingComplete())
  const [askNousData, setAskNousData] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)

  // Demo runner only ticks when the Falcon 9 session is in focus AND
  // the prompt has been submitted. Switching away pauses the visuals
  // (the timeline keeps running so nodes finish appearing in the
  // background — the user just isn't watching them).
  const { states, approvalPending, approve } = useDemoRunner({
    active: submitted,
    onFinalResponse: () => {
      setThinking(true)
      setTimeout(() => {
        setThinking(false)
        setResponseText(FINAL_RESPONSE)
      }, 500)
    },
  })

  const sessions = useMemo(() => {
    const order = hasSubmittedOnce ? POST_SUBMIT_SESSION_ORDER : DEFAULT_SESSION_ORDER
    const ids = order.filter((id) => id !== 'new')
    const falcon9Entry = ids.includes('falcon9')
      ? [{ ...SESSIONS.falcon9, active: 'falcon9' === activeSessionId }]
      : []
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
    return [...falcon9Entry, ...dynamicList, ...historyList]
  }, [hasSubmittedOnce, activeSessionId, dynamicSessions])

  const activeSession =
    SESSIONS[activeSessionId] ??
    dynamicSessions.find((s) => s.id === activeSessionId) ??
    SESSIONS.new

  function handleSubmit() {
    if (submitted) return
    setSubmitted(true)
    setHasSubmittedOnce(true)
    setActiveSessionId('falcon9')
    setChatOpen(true)
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      setResponseText(INITIAL_RESPONSE)
    }, 700)
  }

  function handleSelectSession(id) {
    if (id === activeSessionId) return
    setActiveSessionId(id)
    // Don't close the investigate panel just because the user peeks at
    // another session — but do hide the chrome that belongs to falcon9.
    if (id !== 'falcon9') setInvestigation(null)
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
      date: now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).replace(/ /g, ' ') + ', ' + now.toLocaleTimeString('en-GB', {
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
    // From the approval popover — open the desktop view on the amber node.
    const approvalNode = SESSIONS.falcon9.nodes.find(
      (n) => n.id === APPROVAL_NODE_ID,
    )
    setInvestigation({ node: approvalNode, isApprovalContext: true })
  }

  function handleSeeTask(node) {
    // From the selection popover — open the desktop view on whichever node
    // the user clicked.
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

  const isFalcon9 = activeSessionId === 'falcon9'
  const showGraph = activeSession.kind !== 'empty'

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
      />

      {showGraph && (
        <NodeGraph
          session={activeSession}
          runtimeStates={states}
          approvalPending={isFalcon9 && approvalPending && !investigation}
          approvalNodeId={APPROVAL_NODE_ID}
          compressed={!!investigation}
          onApprove={approve}
          onInvestigate={handleInvestigate}
          onSeeTask={handleSeeTask}
          onAskNous={handleAskNous}
        />
      )}

      <AnimatePresence>
        {chatOpen && !investigation && (
          <ChatPanel
            key="chat-panel"
            taskName="Falcon 9 Review"
            promptText={PROMPT_HINT}
            responseText={responseText}
            thinking={thinking}
            askNousData={askNousData}
            onAskNousConsumed={() => setAskNousData(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!submitted && (
          <PromptBar key="prompt-bar" submitted={false} onSubmit={handleSubmit} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {investigation && (
          <InvestigatePanel
            key="investigate"
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
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
