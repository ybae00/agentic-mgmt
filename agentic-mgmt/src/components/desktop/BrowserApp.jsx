import { useState, useRef } from 'react'
import './DesktopApps.css'

export default function BrowserApp() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedResult, setSelectedResult] = useState(null)
  const inputRef = useRef(null)

  async function handleSearch(e) {
    e?.preventDefault()
    const q = query.trim()
    if (!q) return

    setLoading(true)
    setError(null)
    setResults(null)
    setAnswer('')
    setSelectedResult(null)

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, maxResults: 6 }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Search failed')
      }

      const data = await res.json()
      setResults(data.results || [])
      setAnswer(data.answer || '')
    } catch (err) {
      setError(err.message || 'Search failed. Check API configuration.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="browser-app">
      <div className="browser-toolbar">
        <div className="browser-nav-btns">
          <button className="browser-nav-btn" type="button" disabled>
            ←
          </button>
          <button className="browser-nav-btn" type="button" disabled>
            →
          </button>
        </div>
        <form className="browser-url-bar" onSubmit={handleSearch}>
          <svg
            className="browser-search-icon"
            viewBox="0 0 16 16"
            fill="none"
          >
            <circle
              cx="6.5"
              cy="6.5"
              r="4.5"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M10 10l4 4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          <input
            ref={inputRef}
            className="browser-url-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web..."
            type="text"
          />
          {loading && <span className="browser-spinner" />}
        </form>
      </div>

      <div className="browser-content">
        {!results && !loading && !error && (
          <div className="browser-empty">
            <div className="browser-empty-icon">
              <svg viewBox="0 0 48 48" fill="none">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="rgba(140,165,200,0.3)"
                  strokeWidth="2"
                />
                <ellipse
                  cx="24"
                  cy="24"
                  rx="8"
                  ry="20"
                  stroke="rgba(140,165,200,0.3)"
                  strokeWidth="2"
                />
                <path
                  d="M4 24h40M24 4v40"
                  stroke="rgba(140,165,200,0.15)"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <p className="browser-empty-text">Search the web to investigate</p>
          </div>
        )}

        {error && (
          <div className="browser-error">
            <span className="browser-error-icon">!</span>
            <p>{error}</p>
          </div>
        )}

        {answer && (
          <div className="browser-answer">
            <div className="browser-answer-label">AI Summary</div>
            <p className="browser-answer-text">{answer}</p>
          </div>
        )}

        {selectedResult && (
          <div className="browser-reading-pane">
            <button
              className="browser-back-btn"
              onClick={() => setSelectedResult(null)}
              type="button"
            >
              ← Back to results
            </button>
            <h2 className="browser-reading-title">{selectedResult.title}</h2>
            <a
              className="browser-reading-url"
              href={selectedResult.url}
              target="_blank"
              rel="noreferrer"
            >
              {selectedResult.url}
            </a>
            <p className="browser-reading-content">{selectedResult.content}</p>
          </div>
        )}

        {results && !selectedResult && (
          <div className="browser-results">
            {results.map((r, i) => (
              <button
                key={i}
                className="browser-result-card"
                onClick={() => setSelectedResult(r)}
                type="button"
              >
                <div className="browser-result-url">
                  {new URL(r.url).hostname}
                </div>
                <div className="browser-result-title">{r.title}</div>
                <div className="browser-result-snippet">
                  {r.content?.slice(0, 200)}
                  {r.content?.length > 200 ? '...' : ''}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
