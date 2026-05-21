import { motion } from 'framer-motion'
import './AgentResponse.css'

export default function AgentResponse({ text, thinking }) {
  const words = text ? text.split(/(\s+)/) : []

  return (
    <div className="agent-response">
      <div className="agent-response-mask">
        {thinking ? (
          <motion.div
            className="agent-thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="agent-thinking-dot" />
            <span className="agent-thinking-dot" />
            <span className="agent-thinking-dot" />
          </motion.div>
        ) : (
          <motion.p
            key={text}
            className="agent-response-text"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.045 } },
            }}
          >
            {words.map((w, i) => (
              <motion.span
                key={`${i}-${w}`}
                variants={{
                  hidden: { opacity: 0, y: 4, filter: 'blur(4px)' },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { duration: 0.35, ease: 'easeOut' },
                  },
                }}
              >
                {w}
              </motion.span>
            ))}
          </motion.p>
        )}
      </div>
    </div>
  )
}
