import { motion } from 'framer-motion'
import { APPROVAL_COPY } from '../data/demoScript.js'
import './ApprovalPopover.css'

export default function ApprovalPopover({ onApprove, onInvestigate }) {
  return (
    <motion.div
      className="approval-popover"
      initial={{ opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
    >
      <div className="approval-content">
        <div className="approval-title">Approval Needed</div>
        <div className="approval-body">{APPROVAL_COPY.body}</div>
      </div>
      <div className="approval-actions">
        <button type="button" className="approval-btn approval-btn-primary" onClick={onApprove}>
          Approve
        </button>
        <button type="button" className="approval-btn approval-btn-outline" onClick={onInvestigate}>
          Investigate
        </button>
      </div>
    </motion.div>
  )
}
