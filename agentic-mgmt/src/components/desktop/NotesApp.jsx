import { useState, useRef, useCallback } from 'react'
import './DesktopApps.css'

const TOOLBAR_ACTIONS = [
  { cmd: 'bold', icon: 'B', style: 'font-weight:700' },
  { cmd: 'italic', icon: 'I', style: 'font-style:italic' },
  { cmd: 'underline', icon: 'U', style: 'text-decoration:underline' },
  { cmd: 'insertUnorderedList', icon: '•', style: null },
  { cmd: 'insertOrderedList', icon: '1.', style: null },
]

export default function NotesApp({ initialContent }) {
  const editorRef = useRef(null)
  const [activeFormats, setActiveFormats] = useState(new Set())
  const [wordCount, setWordCount] = useState(0)

  const handleFormat = useCallback((cmd) => {
    document.execCommand(cmd, false, null)
    editorRef.current?.focus()
    updateActiveFormats()
  }, [])

  function updateActiveFormats() {
    const formats = new Set()
    for (const action of TOOLBAR_ACTIONS) {
      if (document.queryCommandState(action.cmd)) {
        formats.add(action.cmd)
      }
    }
    setActiveFormats(formats)

    const text = editorRef.current?.innerText || ''
    const words = text.trim().split(/\s+/).filter(Boolean)
    setWordCount(words.length)
  }

  return (
    <div className="notes-app">
      <div className="notes-toolbar">
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.cmd}
            className={`notes-toolbar-btn ${activeFormats.has(action.cmd) ? 'active' : ''}`}
            onClick={() => handleFormat(action.cmd)}
            title={action.cmd}
            type="button"
          >
            <span style={action.style ? { [action.style.split(':')[0]]: action.style.split(':')[1] } : undefined}>
              {action.icon}
            </span>
          </button>
        ))}
        <span className="notes-toolbar-sep" />
        <button
          className="notes-toolbar-btn"
          onClick={() => handleFormat('formatBlock', '<h2>')}
          title="Heading"
          type="button"
        >
          H
        </button>
      </div>
      <div
        ref={editorRef}
        className="notes-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={updateActiveFormats}
        onKeyUp={updateActiveFormats}
        onClick={updateActiveFormats}
        dangerouslySetInnerHTML={{
          __html:
            initialContent ||
            '<h2>Investigation Notes</h2><p>Start typing your notes here...</p>',
        }}
      />
      <div className="notes-statusbar">
        <span>{wordCount} words</span>
        <span>Notes</span>
      </div>
    </div>
  )
}
