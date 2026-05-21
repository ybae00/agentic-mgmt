import { useCallback, useEffect, useRef, useState } from 'react'
import { PLANNING_SYSTEM_PROMPT, ASK_NOUS_SYSTEM_PROMPT } from '../lib/agentPrompts.js'

const ICON_TO_BRANCH = {
  cad: 'cad',
  sim: 'sim',
  docs: 'docs',
  search: 'docs',
  notes: 'docs',
}

async function parseSSEStream(response, onChunk) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const data = JSON.parse(line.slice(6))
        if (
          data.type === 'content_block_delta' &&
          data.delta?.type === 'text_delta'
        ) {
          onChunk(data.delta.text)
        }
      } catch {
        // skip malformed lines
      }
    }
  }
}

export function useRealAgent({ active, prompt }) {
  const [states, setStates] = useState({})
  const [approvalPending, setApprovalPending] = useState(false)
  const [nodes, setNodes] = useState([])
  const [responseText, setResponseText] = useState('')
  const [finalResponseText, setFinalResponseText] = useState('')
  const [thinking, setThinking] = useState(false)
  const [planData, setPlanData] = useState(null)
  const abortRef = useRef(null)
  const timersRef = useRef([])

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    if (!active || !prompt) {
      clearTimers()
      setStates({})
      setApprovalPending(false)
      setNodes([])
      setResponseText('')
      setFinalResponseText('')
      setThinking(false)
      setPlanData(null)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    runPlan(prompt, controller.signal)

    return () => {
      controller.abort()
      clearTimers()
    }
  }, [active, prompt])

  async function runPlan(userPrompt, signal) {
    setThinking(true)
    setResponseText('')
    setNodes([])
    setStates({})
    setApprovalPending(false)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: PLANNING_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
          stream: false,
        }),
        signal,
      })

      if (!res.ok) {
        setThinking(false)
        setResponseText(
          'Failed to connect to AI. Check that ANTHROPIC_API_KEY is configured in your Vercel environment variables.',
        )
        return
      }

      const data = await res.json()
      const rawText =
        data.content?.[0]?.text || data.error || 'No response received.'

      let plan
      try {
        plan = JSON.parse(rawText)
      } catch {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            plan = JSON.parse(jsonMatch[0])
          } catch {
            plan = null
          }
        }
      }

      setThinking(false)

      if (plan?.branches) {
        setPlanData(plan)
        setResponseText(plan.summary || rawText)
        revealNodes(plan)
      } else {
        setResponseText(rawText)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setThinking(false)
        setResponseText('An error occurred while planning. Please try again.')
      }
    }
  }

  function revealNodes(plan) {
    const allNodes = []
    let delay = 500

    const rootNode = {
      id: 'root',
      label: 'Task started',
      parent: null,
      branch: 'root',
      tooltip: plan.summary,
    }
    allNodes.push(rootNode)

    const branchTails = []

    for (const branch of plan.branches) {
      let parentId = 'root'
      const mappedBranch = ICON_TO_BRANCH[branch.icon] || 'docs'

      for (let i = 0; i < branch.steps.length; i++) {
        const step = branch.steps[i]
        const node = {
          id: step.id,
          label: step.label,
          parent: parentId,
          branch: mappedBranch,
          tooltip: step.tooltip || step.content || '',
          content: step.content || '',
        }
        allNodes.push(node)
        parentId = step.id

        if (i === branch.steps.length - 1) {
          branchTails.push(step.id)
        }
      }
    }

    const finalNode = {
      id: 'final',
      label: 'All tasks complete',
      parent: branchTails,
      branch: 'final',
      tooltip: plan.finalSummary || 'All branches resolved.',
    }
    allNodes.push(finalNode)

    setNodes(allNodes)

    schedule(() => setStates((s) => ({ ...s, root: 'complete' })), delay)
    delay += 400

    let hasApproval = false
    const approvalStepId = []
    const postApprovalSteps = []

    for (const branch of plan.branches) {
      let branchDelay = delay
      const mappedBranch = ICON_TO_BRANCH[branch.icon] || 'docs'

      for (let i = 0; i < branch.steps.length; i++) {
        const step = branch.steps[i]

        if (step.needsApproval && !hasApproval) {
          hasApproval = true
          approvalStepId.push(step.id)
          schedule(() => {
            setStates((s) => ({ ...s, [step.id]: 'needs-approval' }))
            setApprovalPending(true)
          }, branchDelay)

          for (let j = i + 1; j < branch.steps.length; j++) {
            postApprovalSteps.push({
              step: branch.steps[j],
              isLast: j === branch.steps.length - 1,
            })
          }
          break
        }

        const isLast = i === branch.steps.length - 1
        schedule(
          () => setStates((s) => ({ ...s, [step.id]: 'active' })),
          branchDelay,
        )

        if (isLast) {
          schedule(
            () => setStates((s) => ({ ...s, [step.id]: 'complete' })),
            branchDelay + 1500,
          )
        } else {
          schedule(
            () => setStates((s) => ({ ...s, [step.id]: 'complete' })),
            branchDelay + 1200,
          )
        }

        branchDelay += 2000
      }

      delay += 1200
    }

    if (!hasApproval) {
      const totalSteps = plan.branches.reduce(
        (sum, b) => sum + b.steps.length,
        0,
      )
      const finalDelay = 500 + 400 + totalSteps * 2000 + 1000
      schedule(() => {
        setStates((s) => ({ ...s, final: 'complete' }))
        setFinalResponseText(plan.finalSummary || '')
      }, finalDelay)
    }
  }

  function schedule(fn, ms) {
    const t = setTimeout(fn, ms)
    timersRef.current.push(t)
  }

  const approve = useCallback(() => {
    if (!approvalPending || !planData) return
    setApprovalPending(false)

    setStates((s) => {
      const next = { ...s }
      for (const key of Object.keys(next)) {
        if (next[key] === 'needs-approval') next[key] = 'complete'
      }
      return next
    })

    let delay = 800
    let postApprovalCount = 0

    for (const branch of planData.branches) {
      let foundApproval = false
      for (let i = 0; i < branch.steps.length; i++) {
        if (branch.steps[i].needsApproval) {
          foundApproval = true
          continue
        }
        if (!foundApproval) continue

        const step = branch.steps[i]
        postApprovalCount++
        schedule(
          () => setStates((s) => ({ ...s, [step.id]: 'active' })),
          delay,
        )
        schedule(
          () => setStates((s) => ({ ...s, [step.id]: 'complete' })),
          delay + 1200,
        )
        delay += 1800
      }
    }

    schedule(() => {
      setStates((s) => ({ ...s, final: 'complete' }))
      setFinalResponseText(planData.finalSummary || '')
    }, delay + 800)
  }, [approvalPending, planData])

  const askNous = useCallback(async (node, question) => {
    const contextMsg = `Task step: "${node.label}"\nDetails: ${node.tooltip || ''}\n${node.content ? `Findings: ${node.content}` : ''}\n\nUser question: ${question}`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: ASK_NOUS_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: contextMsg }],
          stream: true,
        }),
      })

      if (!res.ok) return 'Failed to get a response. Check API configuration.'

      let answer = ''
      await parseSSEStream(res, (chunk) => {
        answer += chunk
      })
      return answer || 'No response received.'
    } catch {
      return 'An error occurred while processing your question.'
    }
  }, [])

  return {
    states,
    approvalPending,
    approve,
    nodes,
    responseText,
    finalResponseText,
    thinking,
    askNous,
  }
}
