import { useCallback, useEffect, useRef, useState } from 'react'
import { DEMO_NODES } from '../data/demoScript.js'

// 1.0 = script timing. 1.1 = 10% slower (used to give the agent more room
// to breathe per the latest design pass).
const SPEED_MULTIPLIER = 1.1

// Drives the scripted timeline:
//   - schedules pre-approval nodes off prompt submit (t=0)
//   - pauses when the needs-approval node lands
//   - resumes post-approval nodes when `approve()` is called
//   - fires onFinalResponse once the last node settles
export function useDemoRunner({ active, onFinalResponse }) {
  const [states, setStates] = useState({}) // id -> 'active' | 'complete' | 'needs-approval'
  const [approvalPending, setApprovalPending] = useState(false)
  const timers = useRef([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const scheduleNode = useCallback((node) => {
    const appearMs = node.delay * SPEED_MULTIPLIER
    const settleMs =
      node.completesAfter != null ? node.completesAfter * SPEED_MULTIPLIER : null
    const appear = setTimeout(() => {
      setStates((s) => ({ ...s, [node.id]: node.initialState }))
      if (node.needsApproval) {
        setApprovalPending(true)
        return
      }
      if (settleMs != null && node.initialState === 'active') {
        const settle = setTimeout(() => {
          setStates((s) => ({ ...s, [node.id]: 'complete' }))
        }, settleMs)
        timers.current.push(settle)
      }
    }, appearMs)
    timers.current.push(appear)
  }, [])

  useEffect(() => {
    if (!active) {
      // reset on deactivate so the demo can be re-run
      clearTimers()
      setStates({})
      setApprovalPending(false)
      return
    }
    DEMO_NODES.filter((n) => !n.afterApproval).forEach(scheduleNode)
    return clearTimers
  }, [active, scheduleNode])

  const approve = useCallback(() => {
    if (!approvalPending) return
    setApprovalPending(false)
    setStates((s) => ({ ...s, 'cad-approval': 'complete' }))

    const afterNodes = DEMO_NODES.filter((n) => n.afterApproval)
    afterNodes.forEach(scheduleNode)

    const lastSettle =
      Math.max(...afterNodes.map((n) => n.delay + (n.completesAfter ?? 0))) *
      SPEED_MULTIPLIER
    const final = setTimeout(() => onFinalResponse?.(), lastSettle + 800)
    timers.current.push(final)
  }, [approvalPending, scheduleNode, onFinalResponse])

  return { states, approvalPending, approve }
}
