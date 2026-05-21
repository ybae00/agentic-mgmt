import { useEffect, useRef, useState } from 'react'
import './DesktopApps.css'

const WELCOME_MSG = `\x1b[1;36mNous Terminal\x1b[0m v1.0.0
Type \x1b[33mhelp\x1b[0m for available commands, or \x1b[33mpython\x1b[0m to enter Python mode.
`

const HELP_TEXT = `
\x1b[1mAvailable commands:\x1b[0m
  \x1b[33mhelp\x1b[0m          Show this help message
  \x1b[33mpython\x1b[0m        Enter Python REPL (uses Pyodide/WebAssembly)
  \x1b[33mexit\x1b[0m          Exit Python mode / clear screen
  \x1b[33mclear\x1b[0m         Clear the terminal
  \x1b[33mecho <text>\x1b[0m   Print text
  \x1b[33mdate\x1b[0m          Show current date/time
  \x1b[33mls\x1b[0m            List files (simulated)
  \x1b[33mcat <file>\x1b[0m    View file contents (simulated)
  \x1b[33mwhoami\x1b[0m        Show current user
`

const SIMULATED_FILES = {
  'thrust_sim.py': `import numpy as np\n\n# Falcon 9 thrust simulation\nIsp_vac = 311  # seconds\nIsp_sl = 282   # seconds\nthrust_sl = 854  # kN\n\nprint(f"Sea-level thrust: {thrust_sl} kN")`,
  'propellant.csv': 'name,density_kg_m3,temp_k\nLOX,1141,90.2\nRP-1,820,293.15',
  'design_spec_v4.docx': '[Binary file — open in Pages]',
  'falcon9_thruster.fcstd': '[Binary file — open in FreeCAD]',
  'README.md': '# Falcon 9 Review\nAutomated review of CAD, simulation, and documentation.',
}

export default function TerminalApp() {
  const termRef = useRef(null)
  const xtermRef = useRef(null)
  const pyodideRef = useRef(null)
  const [pythonMode, setPythonMode] = useState(false)
  const lineBuffer = useRef('')
  const pythonModeRef = useRef(false)
  const loadingPyodide = useRef(false)

  useEffect(() => {
    let term
    let fitAddon

    async function init() {
      const { Terminal } = await import('xterm')
      const { FitAddon } = await import('xterm-addon-fit')
      await import('xterm/css/xterm.css')

      term = new Terminal({
        fontSize: 11,
        fontFamily: "'JetBrains Mono', Menlo, monospace",
        theme: {
          background: '#0a0a0e',
          foreground: '#e0e0e0',
          cursor: '#4a9eff',
          selectionBackground: 'rgba(74, 158, 255, 0.3)',
          black: '#0a0a0e',
          red: '#e05454',
          green: '#4cd2a1',
          yellow: '#e0c060',
          blue: '#4a9eff',
          magenta: '#c084fc',
          cyan: '#56c8ff',
          white: '#e0e0e0',
        },
        cursorBlink: true,
        scrollback: 1000,
      })

      fitAddon = new FitAddon()
      term.loadAddon(fitAddon)

      if (termRef.current) {
        term.open(termRef.current)
        fitAddon.fit()
      }

      xtermRef.current = term

      term.write(WELCOME_MSG)
      writePrompt(term)

      term.onKey(({ key, domEvent }) => {
        const code = domEvent.keyCode

        if (code === 13) {
          term.write('\r\n')
          const cmd = lineBuffer.current.trim()
          lineBuffer.current = ''
          handleCommand(cmd, term)
        } else if (code === 8) {
          if (lineBuffer.current.length > 0) {
            lineBuffer.current = lineBuffer.current.slice(0, -1)
            term.write('\b \b')
          }
        } else if (key.length === 1 && !domEvent.ctrlKey && !domEvent.altKey) {
          lineBuffer.current += key
          term.write(key)
        } else if (domEvent.ctrlKey && domEvent.key === 'c') {
          lineBuffer.current = ''
          term.write('^C\r\n')
          writePrompt(term)
        }
      })

      const ro = new ResizeObserver(() => fitAddon.fit())
      if (termRef.current) ro.observe(termRef.current)

      return () => {
        ro.disconnect()
        term.dispose()
      }
    }

    const cleanup = init()
    return () => {
      cleanup.then?.((fn) => fn?.())
    }
  }, [])

  function writePrompt(term) {
    if (pythonModeRef.current) {
      term.write('\x1b[33m>>> \x1b[0m')
    } else {
      term.write('\x1b[36mnous\x1b[0m:\x1b[34m~/project\x1b[0m$ ')
    }
  }

  async function handleCommand(cmd, term) {
    if (pythonModeRef.current) {
      await handlePythonCommand(cmd, term)
      return
    }

    const parts = cmd.split(/\s+/)
    const base = parts[0]?.toLowerCase()
    const args = parts.slice(1).join(' ')

    switch (base) {
      case '':
        break
      case 'help':
        term.write(HELP_TEXT)
        break
      case 'clear':
        term.clear()
        break
      case 'echo':
        term.write(args + '\r\n')
        break
      case 'date':
        term.write(new Date().toString() + '\r\n')
        break
      case 'whoami':
        term.write('nous-agent\r\n')
        break
      case 'ls':
        for (const name of Object.keys(SIMULATED_FILES)) {
          term.write('  ' + name + '\r\n')
        }
        break
      case 'cat': {
        const file = SIMULATED_FILES[args]
        if (file) {
          term.write(file + '\r\n')
        } else {
          term.write(`\x1b[31mcat: ${args}: No such file\x1b[0m\r\n`)
        }
        break
      }
      case 'python':
        await enterPythonMode(term)
        break
      case 'exit':
        term.write('Goodbye.\r\n')
        break
      default:
        term.write(`\x1b[31m${base}: command not found\x1b[0m\r\n`)
    }

    writePrompt(term)
  }

  async function enterPythonMode(term) {
    pythonModeRef.current = true
    setPythonMode(true)

    if (!pyodideRef.current) {
      if (loadingPyodide.current) {
        term.write('Pyodide is still loading...\r\n')
        return
      }
      loadingPyodide.current = true
      term.write('\x1b[33mLoading Python (Pyodide)...\x1b[0m\r\n')

      try {
        if (!window.loadPyodide) {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js'
          document.head.appendChild(script)
          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
          })
        }
        pyodideRef.current = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
        })
        term.write(
          `\x1b[32mPython ${pyodideRef.current.version} ready\x1b[0m\r\n`,
        )
      } catch {
        term.write(
          '\x1b[31mFailed to load Pyodide. Check your internet connection.\x1b[0m\r\n',
        )
        pythonModeRef.current = false
        setPythonMode(false)
        loadingPyodide.current = false
      }
    } else {
      term.write(`\x1b[32mPython REPL active\x1b[0m\r\n`)
    }
  }

  async function handlePythonCommand(cmd, term) {
    if (cmd === 'exit' || cmd === 'quit()') {
      pythonModeRef.current = false
      setPythonMode(false)
      term.write('Exiting Python mode.\r\n')
      writePrompt(term)
      return
    }

    if (!pyodideRef.current) {
      term.write('\x1b[31mPyodide not loaded\x1b[0m\r\n')
      writePrompt(term)
      return
    }

    if (cmd) {
      try {
        pyodideRef.current.runPython(`
import sys, io
__stdout = sys.stdout
sys.stdout = io.StringIO()
`)
        const result = pyodideRef.current.runPython(cmd)
        const stdout = pyodideRef.current.runPython(
          'sys.stdout.getvalue()',
        )
        pyodideRef.current.runPython('sys.stdout = __stdout')

        if (stdout) term.write(stdout.replace(/\n/g, '\r\n'))
        if (result !== undefined && result !== null && !stdout) {
          term.write(String(result) + '\r\n')
        }
      } catch (err) {
        term.write(`\x1b[31m${err.message}\x1b[0m\r\n`)
      }
    }

    writePrompt(term)
  }

  return (
    <div className="terminal-app">
      <div className="terminal-header">
        <span className="terminal-tab active">Terminal</span>
        <span className="terminal-tab">
          {pythonMode ? 'Python' : 'bash'}
        </span>
      </div>
      <div ref={termRef} className="terminal-body" />
    </div>
  )
}
