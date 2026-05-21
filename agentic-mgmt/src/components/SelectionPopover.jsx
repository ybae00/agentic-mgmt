import { useState } from 'react'
import { motion } from 'framer-motion'
import sendIcon from '../assets/icons/send.svg'
import './SelectionPopover.css'

const BRANCH_CATEGORIES = {
  sim: 'Python',
  cad: 'CAD',
  docs: 'Docs',
  root: 'System',
  final: 'System',
}

const BRANCH_ICONS = {
  sim: (
    <svg viewBox="0 0 256 255" className="sel-icon">
      <defs>
        <linearGradient id="selPyBlue" x1="12.96%" y1="12.07%" x2="79.64%" y2="78.8%">
          <stop offset="0%" stopColor="#387EB8"/>
          <stop offset="100%" stopColor="#366994"/>
        </linearGradient>
        <linearGradient id="selPyYellow" x1="19.13%" y1="20.58%" x2="90.43%" y2="88.01%">
          <stop offset="0%" stopColor="#FFC836"/>
          <stop offset="100%" stopColor="#FFD43B"/>
        </linearGradient>
      </defs>
      <path d="M126.9 0C62.7 0 66.7 27.6 66.7 27.6l.1 28.6h61.3v8.6H39.2S0 60.7 0 126.2c0 65.5 34.2 63.2 34.2 63.2h20.4v-30.4s-1.1-34.2 33.7-34.2h58c32.3 0 34-33.1 34-33.1V33.1S184.3 0 126.9 0zM92.3 19.1a11 11 0 110 22 11 11 0 010-22z" fill="url(#selPyBlue)"/>
      <path d="M128.8 254.1c64.2 0 60.2-27.6 60.2-27.6l-.1-28.6h-61.3v-8.6h88.9s39.2 4.1 39.2-61.4c0-65.5-34.2-63.2-34.2-63.2h-20.4v30.4s1.1 34.2-33.7 34.2h-58c-32.3 0-34 33.1-34 33.1v58.7s-5.2 33-60.2 33zm34.6-19.1a11 11 0 110-22 11 11 0 010 22z" fill="url(#selPyYellow)"/>
    </svg>
  ),
  cad: (
    <svg viewBox="0 0 24 24" className="sel-icon">
      <rect width="24" height="24" rx="4" fill="#D42B2B"/>
      <path d="M7 17L12 5l5 12h-2.4l-1-2.8H10.4L9.4 17H7zm4-4.6h2l-1-2.8-1 2.8z" fill="#fff"/>
    </svg>
  ),
  docs: (
    <svg viewBox="0 0 24 24" fill="none" className="sel-icon">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#4285F4"/>
      <path d="M14 2v6h6" fill="#A1C2FA"/>
      <path d="M8 13h8M8 17h5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  root: (
    <svg viewBox="0 0 24 24" fill="none" className="sel-icon">
      <circle cx="12" cy="12" r="10" fill="#888"/>
      <path d="M12 8v4l3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  final: (
    <svg viewBox="0 0 24 24" fill="none" className="sel-icon">
      <circle cx="12" cy="12" r="10" fill="#2a9d6f"/>
      <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

function getStatusBadge(node) {
  if (node.state === 'complete') return { label: 'Nominal', cls: 'sel-badge-nominal' }
  if (node.state === 'active') return { label: 'Running', cls: 'sel-badge-running' }
  if (node.state === 'needs-approval') return { label: 'Pending', cls: 'sel-badge-pending' }
  return { label: 'Nominal', cls: 'sel-badge-nominal' }
}

export default function SelectionPopover({ node, onSeeTask, onAskNous, onClose }) {
  const [askNousOpen, setAskNousOpen] = useState(false)
  const [askValue, setAskValue] = useState('')

  function handleAskSubmit() {
    const q = askValue.trim()
    if (!q) return
    onAskNous?.(node, q)
  }
  const isStatus = node.branch === 'sim'
  const showActions = node.branch !== 'root' && node.branch !== 'final'
  const category = BRANCH_CATEGORIES[node.branch] || node.branch
  const icon = BRANCH_ICONS[node.branch] || BRANCH_ICONS.root
  const badge = getStatusBadge(node)

  return (
    <motion.div
      className="selection-popover"
      initial={{ opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      <div className="selection-card">
        {isStatus ? (
          <div className="selection-info" style={{ gap: 8 }}>
            <div className="selection-header">
              <div className="selection-category">
                {icon}
                <span className="selection-cat-label">{category}</span>
              </div>
              <span className={`selection-badge ${badge.cls}`}>{badge.label}</span>
            </div>
            <div className="selection-content">
              <div className="selection-title">{node.label}</div>
              {node.tooltip && <div className="selection-body">{node.tooltip}</div>}
            </div>
          </div>
        ) : (
          <div className="selection-info" style={{ gap: 8 }}>
            <div className="selection-category">
              {icon}
              <span className="selection-cat-label">{category}</span>
            </div>
            <div className="selection-content">
              <div className="selection-title">{node.label}</div>
              {node.tooltip && <div className="selection-body">{node.tooltip}</div>}
            </div>
          </div>
        )}

        {showActions && (
          <div className="selection-actions">
            <button type="button" className="sel-btn sel-btn-primary" onClick={onSeeTask}>
              See task
            </button>
            {!askNousOpen && (
              <button
                type="button"
                className="sel-btn sel-btn-secondary"
                onClick={() => setAskNousOpen(true)}
              >
                Ask Nous
              </button>
            )}
            <button type="button" className="sel-btn sel-btn-close" onClick={onClose}>
              <svg viewBox="0 0 12 12" width="10" height="10">
                <path d="M2 2l8 8M10 2l-8 8" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {askNousOpen && (
        <div className="selection-ask-wrap">
          <input
            className="selection-ask-input"
            type="text"
            placeholder="Ask anything..."
            value={askValue}
            onChange={(e) => setAskValue(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Escape') setAskNousOpen(false)
              if (e.key === 'Enter') handleAskSubmit()
            }}
          />
          {askValue && (
            <button type="button" className="selection-ask-send" onClick={handleAskSubmit}>
              <img src={sendIcon} alt="Send" width="16" height="16" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}
