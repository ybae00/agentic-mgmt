import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './Onboarding.css'

const STORAGE_KEY = 'nous-onboarding-complete'

const TOUR_STEPS = [
  {
    target: '[data-onboarding="sidebar"]',
    title: 'Sessions',
    body: 'Your workspace for managing agent sessions. Start new tasks, revisit past investigations, and switch between active sessions.',
    placement: 'right',
  },
  {
    target: '[data-onboarding="prompt"]',
    title: 'Agent prompt',
    body: 'Describe what you need the agent to work on. It will decompose your request into a graph of tasks and execute them autonomously.',
    placement: 'top',
  },
]

export default function Onboarding({ onComplete }) {
  const [phase, setPhase] = useState('welcome') // 'welcome' | 'tour' | 'done'
  const [step, setStep] = useState(0)
  const [spotlightRect, setSpotlightRect] = useState(null)

  const measureTarget = useCallback(() => {
    if (phase !== 'tour') return
    const selector = TOUR_STEPS[step]?.target
    if (!selector) return
    const el = document.querySelector(selector)
    if (!el) return
    const r = el.getBoundingClientRect()
    setSpotlightRect((prev) => {
      if (
        prev &&
        prev.top === r.top &&
        prev.left === r.left &&
        prev.width === r.width &&
        prev.height === r.height
      )
        return prev
      return { top: r.top, left: r.left, width: r.width, height: r.height }
    })
  }, [phase, step])

  useEffect(() => {
    if (phase !== 'tour') return
    measureTarget()
    const onResize = () => measureTarget()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [phase, step, measureTarget])

  function handleStart() {
    setPhase('tour')
  }

  function handleNext() {
    if (step < TOUR_STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      finish()
    }
  }

  function handleSkip() {
    finish()
  }

  function finish() {
    setPhase('done')
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {}
    onComplete?.()
  }

  if (phase === 'done') return null

  if (phase === 'welcome') {
    return createPortal(
      <WelcomePage onStart={handleStart} onSkip={handleSkip} />,
      document.body,
    )
  }

  const currentStep = TOUR_STEPS[step]
  const isLast = step === TOUR_STEPS.length - 1
  const pad = 8

  const tooltipStyle = computeTooltipPosition(spotlightRect, currentStep.placement, pad)

  return createPortal(
    <>
      <div className="onboarding-backdrop" />

      <AnimatePresence mode="wait">
        {spotlightRect && (
          <motion.div
            key={`spotlight-${step}`}
            className="onboarding-spotlight"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              top: spotlightRect.top - pad,
              left: spotlightRect.left - pad,
              width: spotlightRect.width + pad * 2,
              height: spotlightRect.height + pad * 2,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 28, mass: 0.8 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {spotlightRect && (
          <motion.div
            key={`tooltip-${step}`}
            className="onboarding-tooltip"
            style={tooltipStyle}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="onboarding-tooltip-header">
              <span className="onboarding-tooltip-step">
                {step + 1} / {TOUR_STEPS.length}
              </span>
            </div>
            <h3 className="onboarding-tooltip-title">{currentStep.title}</h3>
            <p className="onboarding-tooltip-body">{currentStep.body}</p>
            <div className="onboarding-tooltip-actions">
              <button
                className="onboarding-btn-skip"
                type="button"
                onClick={handleSkip}
              >
                Skip
              </button>
              <button
                className="onboarding-btn-next"
                type="button"
                onClick={handleNext}
              >
                {isLast ? 'Get started' : 'Next'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  )
}

function computeTooltipPosition(rect, placement, pad) {
  if (!rect) return { top: '50%', left: '50%' }
  const gap = 16
  switch (placement) {
    case 'right':
      return {
        top: rect.top,
        left: rect.left + rect.width + pad + gap,
      }
    case 'left':
      return {
        top: rect.top,
        right: window.innerWidth - rect.left + pad + gap,
      }
    case 'top':
      return {
        bottom: window.innerHeight - rect.top + pad + gap,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
      }
    case 'bottom':
      return {
        top: rect.top + rect.height + pad + gap,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
      }
    default:
      return { top: rect.top, left: rect.left + rect.width + pad + gap }
  }
}

export function isOnboardingComplete() {
  try {
    if (new URLSearchParams(window.location.search).has('onboarding')) {
      localStorage.removeItem(STORAGE_KEY)
      return false
    }
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ */
/* Welcome page                                                        */
/* ------------------------------------------------------------------ */

function WelcomePage({ onStart, onSkip }) {
  return (
    <motion.div
      className="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="welcome-glow" aria-hidden />

      <motion.div
        className="welcome-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="welcome-badge">Agentic Management</div>

        <h1 className="welcome-title">Nous</h1>

        <p className="welcome-etymology">
          from Greek <em>νοῦς</em> — mind, intellect, reason
        </p>

        <p className="welcome-description">
          An autonomous agent workspace that decomposes complex tasks into
          executable graphs. Describe what you need, and Nous will plan,
          coordinate, and deliver — with you in the loop for critical
          decisions.
        </p>

        <div className="welcome-actions">
          <button
            className="welcome-start"
            type="button"
            onClick={onStart}
          >
            Start
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7h10M8 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="welcome-skip"
            type="button"
            onClick={onSkip}
          >
            Skip intro
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
