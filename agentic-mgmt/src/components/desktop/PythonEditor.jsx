import { useState, useRef } from 'react'
import './DesktopApps.css'

const DEFAULT_CODE = `import numpy as np

# Falcon 9 thrust simulation
Isp_vac = 311    # seconds (vacuum)
Isp_sl  = 282    # seconds (sea level)
g0      = 9.80665  # m/s^2

# Calculate exhaust velocities
Ve_vac = Isp_vac * g0
Ve_sl  = Isp_sl * g0

# Mass flow rate (kg/s) — Merlin 1D
mdot = 845 / Ve_sl  # from F = mdot * Ve

print(f"Vacuum exhaust velocity:    {Ve_vac:.1f} m/s")
print(f"Sea-level exhaust velocity: {Ve_sl:.1f} m/s")
print(f"Mass flow rate:             {mdot:.2f} kg/s")
print(f"Sea-level thrust:           {mdot * Ve_sl / 1000:.0f} kN")
print(f"Vacuum thrust:              {mdot * Ve_vac / 1000:.0f} kN")
`

export default function PythonEditor({ initialCode }) {
  const [code, setCode] = useState(initialCode || DEFAULT_CODE)
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [pyodideReady, setPyodideReady] = useState(false)
  const pyodideRef = useRef(null)
  const textareaRef = useRef(null)

  async function loadPyodideIfNeeded() {
    if (pyodideRef.current) return pyodideRef.current

    setOutput('Loading Python runtime (Pyodide)...\n')

    if (!window.loadPyodide) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js'
      document.head.appendChild(script)
      await new Promise((resolve, reject) => {
        script.onload = resolve
        script.onerror = reject
      })
    }

    const pyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
    })

    await pyodide.loadPackage('numpy')
    pyodideRef.current = pyodide
    setPyodideReady(true)
    return pyodide
  }

  async function handleRun() {
    setRunning(true)
    setOutput('')

    try {
      const pyodide = await loadPyodideIfNeeded()

      pyodide.runPython(`
import sys, io
__stdout = sys.stdout
__stderr = sys.stderr
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`)

      try {
        pyodide.runPython(code)
      } catch (err) {
        const stderr = pyodide.runPython('sys.stderr.getvalue()')
        pyodide.runPython('sys.stdout = __stdout; sys.stderr = __stderr')
        setOutput(stderr || err.message)
        setRunning(false)
        return
      }

      const stdout = pyodide.runPython('sys.stdout.getvalue()')
      const stderr = pyodide.runPython('sys.stderr.getvalue()')
      pyodide.runPython('sys.stdout = __stdout; sys.stderr = __stderr')

      setOutput((stdout || '') + (stderr ? '\n' + stderr : ''))
    } catch (err) {
      setOutput('Error: ' + err.message)
    } finally {
      setRunning(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = textareaRef.current
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const val = code
      setCode(val.substring(0, start) + '    ' + val.substring(end))
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4
      })
    }
  }

  return (
    <div className="pyeditor">
      <div className="pyeditor-tabs">
        <span className="pyeditor-tab active">thrust_sim.py</span>
        <span className="pyeditor-tab">propellant.csv</span>
      </div>
      <div className="pyeditor-main">
        <div className="pyeditor-gutter">
          {code.split('\n').map((_, i) => (
            <span key={i} className="pyeditor-line-num">
              {i + 1}
            </span>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="pyeditor-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
      </div>
      <div className="pyeditor-toolbar">
        <button
          className="pyeditor-run-btn"
          onClick={handleRun}
          disabled={running}
          type="button"
        >
          {running ? '⏳ Running...' : '▶ Run'}
        </button>
        <span className="pyeditor-status">
          {pyodideReady ? '● Python ready' : '○ Python not loaded'}
        </span>
      </div>
      {output && (
        <div className="pyeditor-output">
          <div className="pyeditor-output-header">Output</div>
          <pre className="pyeditor-output-text">{output}</pre>
        </div>
      )}
    </div>
  )
}
