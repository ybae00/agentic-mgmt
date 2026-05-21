import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NODE_WIDTH, NODE_HEIGHT } from '../data/nodePositions.js'
import './TaskNode.css'

export default function TaskNode({ node, state, position, onClick }) {
  const [hover, setHover] = useState(false)
  const left = position.x - NODE_WIDTH / 2
  const top = position.y - NODE_HEIGHT / 2
  const clickable = state === 'needs-approval' && !!onClick

  return (
    <motion.div
      className={`task-node glass state-${state} ${clickable ? 'clickable' : ''}`}
      style={{ left, top, width: NODE_WIDTH, height: NODE_HEIGHT }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24, mass: 0.6 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      onClick={clickable ? onClick : undefined}
    >
      <span className="task-node-dot" />
      <span className="task-node-label" title={node.label}>
        {node.label}
      </span>

      <AnimatePresence>
        {hover && (
          <motion.div
            className="task-node-tooltip glass"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <div className="task-node-tooltip-title">{node.label}</div>
            <div className="task-node-tooltip-body">{node.tooltip}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
