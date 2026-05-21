import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PROMPT_HINT } from '../data/demoScript.js'
import sendIcon from '../assets/icons/send.svg'
import './PromptBar.css'

export default function PromptBar({ submitted, onSubmit }) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef(null)

  const hasText = value.trim().length > 0

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value])

  function handleSubmit(e) {
    e.preventDefault()
    const text = value.trim()
    if (!text) return
    onSubmit(text)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  function useDemoPrompt() {
    setValue(PROMPT_HINT)
  }

  return (
    <motion.form
      className="prompt-wrap"
      data-onboarding="prompt"
      onSubmit={handleSubmit}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className={`prompt-bar ${hasText ? 'has-text' : ''} ${focused ? 'focused' : ''}`}>
        <textarea
          ref={textareaRef}
          className="prompt-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="what should we do today?"
          rows={1}
          autoFocus
        />
        {hasText && (
          <button
            type="submit"
            className="prompt-send"
            aria-label="Send prompt"
          >
            <img src={sendIcon} alt="Send" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {!submitted && (
          <motion.button
            key="demo-chip"
            type="button"
            className="prompt-hint-chip"
            onClick={useDemoPrompt}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, delay: 0.4 }}
          >
            <span className="prompt-hint-key">↩</span>
            <span className="prompt-hint-text">
              Try: "Check the Falcon 9 launch vehicle…"
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.form>
  )
}
