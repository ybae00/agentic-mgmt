// Per-session graph data. The Falcon 9 session is driven live by the demo
// runner; the others are static "history" graphs the user can browse.
//
// Each node: { id, label, tooltip, branch }
// Edges are derived from each node's parent(s) — same shape as DEMO_NODES.

import { DEMO_NODES } from './demoScript.js'

// Helper: pre-baked nodes default to 'complete' state, and we strip the
// runtime-only fields (delay/completesAfter/etc.) since they're not needed.
function staticNode({ id, label, tooltip, parent, branch }) {
  return { id, label, tooltip, parent, branch }
}

// --- Engine cluster torque sweep -------------------------------------------
const engineTorque = [
  staticNode({ id: 'et-root', label: 'Task started', parent: null, branch: 'root', tooltip: 'Started the 9-engine torque sweep review.' }),

  staticNode({ id: 'et-cad-1', label: 'Open CAD — engine cluster', parent: 'et-root', branch: 'cad', tooltip: 'Loaded the 9-engine octaweb assembly.' }),
  staticNode({ id: 'et-cad-2', label: 'Map mount bolt pattern', parent: 'et-cad-1', branch: 'cad', tooltip: 'Indexed 144 mount bolts across the octaweb.' }),
  staticNode({ id: 'et-cad-3', label: 'Extract torque preloads', parent: 'et-cad-2', branch: 'cad', tooltip: 'Pulled the per-bolt preload spec from the CAD attributes.' }),
  staticNode({ id: 'et-cad-4', label: 'CAD pass complete', parent: 'et-cad-3', branch: 'cad', tooltip: 'CAD branch done — bolt patterns indexed.' }),

  staticNode({ id: 'et-sim-1', label: 'Open Python — torque_sweep.py', parent: 'et-root', branch: 'sim', tooltip: 'Loaded the torque sweep script.' }),
  staticNode({ id: 'et-sim-2', label: 'Sweep 60–140 N·m', parent: 'et-sim-1', branch: 'sim', tooltip: 'Ran a parameter sweep across the torque envelope.' }),
  staticNode({ id: 'et-sim-3', label: 'Flag 3 outliers', parent: 'et-sim-2', branch: 'sim', tooltip: 'Three bolts showed >2σ variance from spec.' }),
  staticNode({ id: 'et-sim-4', label: 'Adjust preload curves', parent: 'et-sim-3', branch: 'sim', tooltip: 'Adjusted preload curves for the outlier bolts.' }),
  staticNode({ id: 'et-sim-5', label: 'Re-run sweep — clean', parent: 'et-sim-4', branch: 'sim', tooltip: 'Re-ran sweep — all bolts within tolerance.' }),

  staticNode({ id: 'et-docs-1', label: 'Open Docs — assembly_proc.docx', parent: 'et-root', branch: 'docs', tooltip: 'Opened the engine assembly procedure.' }),
  staticNode({ id: 'et-docs-2', label: 'Update torque table §4.2', parent: 'et-docs-1', branch: 'docs', tooltip: 'Updated the torque reference table with the new preloads.' }),

  staticNode({ id: 'et-final', label: 'Review complete', parent: ['et-cad-4', 'et-sim-5', 'et-docs-2'], branch: 'final', tooltip: 'All three branches resolved cleanly.' }),
]

// --- Avionics harness audit -------------------------------------------------
const avionics = [
  staticNode({ id: 'av-root', label: 'Task started', parent: null, branch: 'root', tooltip: 'Started the avionics harness audit.' }),

  staticNode({ id: 'av-cad-1', label: 'Open CAD — harness routing', parent: 'av-root', branch: 'cad', tooltip: 'Loaded the harness routing model.' }),
  staticNode({ id: 'av-cad-2', label: 'Trace 47 cable runs', parent: 'av-cad-1', branch: 'cad', tooltip: 'Walked all 47 cable runs end-to-end.' }),
  staticNode({ id: 'av-cad-3', label: 'Check bend radius compliance', parent: 'av-cad-2', branch: 'cad', tooltip: 'Verified each run meets the minimum bend radius.' }),

  staticNode({ id: 'av-doc-1', label: 'Open Docs — wire list rev 3', parent: 'av-root', branch: 'docs', tooltip: 'Opened the master wire list.' }),
  staticNode({ id: 'av-doc-2', label: 'Cross-check connector pinouts', parent: 'av-doc-1', branch: 'docs', tooltip: 'Diffed connector pinouts against the schematic.' }),
  staticNode({ id: 'av-doc-3', label: 'Sync pinout discrepancies', parent: 'av-doc-2', branch: 'docs', tooltip: 'Fixed 4 stale pinouts on the J7 connector.' }),

  staticNode({ id: 'av-test-1', label: 'Run continuity test plan', parent: 'av-root', branch: 'sim', tooltip: 'Generated and ran the continuity test plan.' }),
  staticNode({ id: 'av-test-2', label: 'All 312 nets pass', parent: 'av-test-1', branch: 'sim', tooltip: 'All nets pass continuity.' }),

  staticNode({ id: 'av-final', label: 'Audit complete', parent: ['av-cad-3', 'av-doc-3', 'av-test-2'], branch: 'final', tooltip: 'Harness audit finished — 4 pinouts fixed, all nets clean.' }),
]

// --- LOX tank baffle revision ----------------------------------------------
const tankBaffle = [
  staticNode({ id: 'tb-root', label: 'Task started', parent: null, branch: 'root', tooltip: 'Started the LOX tank baffle revision.' }),

  staticNode({ id: 'tb-cad-1', label: 'Open CAD — LOX tank', parent: 'tb-root', branch: 'cad', tooltip: 'Loaded the LOX tank assembly.' }),
  staticNode({ id: 'tb-cad-2', label: 'Revise anti-slosh baffle', parent: 'tb-cad-1', branch: 'cad', tooltip: 'Updated the anti-slosh baffle geometry.' }),
  staticNode({ id: 'tb-cad-3', label: 'Re-check weld access', parent: 'tb-cad-2', branch: 'cad', tooltip: 'Confirmed all welds remain accessible after the revision.' }),

  staticNode({ id: 'tb-sim-1', label: 'Open Python — slosh_cfd.py', parent: 'tb-root', branch: 'sim', tooltip: 'Loaded the sloshing CFD harness.' }),
  staticNode({ id: 'tb-sim-2', label: 'Run slosh dynamics', parent: 'tb-sim-1', branch: 'sim', tooltip: 'Ran sloshing dynamics at 3 fill fractions.' }),
  staticNode({ id: 'tb-sim-3', label: 'Damping +18% vs baseline', parent: 'tb-sim-2', branch: 'sim', tooltip: 'New baffle improves damping by 18% across the envelope.' }),

  staticNode({ id: 'tb-final', label: 'Revision complete', parent: ['tb-cad-3', 'tb-sim-3'], branch: 'final', tooltip: 'Baffle revision approved — damping improved.' }),
]

// --- Session registry ------------------------------------------------------
// `kind: 'demo'` means the demo runner drives it. `kind: 'history'` means
// pre-baked complete nodes are shown as-is.
export const SESSIONS = {
  new: {
    id: 'new',
    label: 'New session',
    meta: '',
    kind: 'empty',
    nodes: [],
  },
  falcon9: {
    id: 'falcon9',
    label: 'Falcon 9 Review',
    meta: 'now',
    date: '21 May 2026, 04:21',
    kind: 'demo',
    nodes: DEMO_NODES,
  },
  'engine-torque': {
    id: 'engine-torque',
    label: 'Engine cluster torque sweep',
    meta: '1d',
    date: '20 May 2026, 14:32',
    kind: 'history',
    nodes: engineTorque,
  },
  avionics: {
    id: 'avionics',
    label: 'Avionics harness audit',
    meta: '3d',
    date: '18 May 2026, 09:15',
    kind: 'history',
    nodes: avionics,
  },
  'tank-baffle': {
    id: 'tank-baffle',
    label: 'LOX tank baffle revision',
    meta: '7d',
    date: '14 May 2026, 16:48',
    kind: 'history',
    nodes: tankBaffle,
  },
}

// Default ordering for the sidebar (Falcon 9 only appears after submit).
export const DEFAULT_SESSION_ORDER = ['new', 'engine-torque', 'avionics', 'tank-baffle']
export const POST_SUBMIT_SESSION_ORDER = ['falcon9', 'engine-torque', 'avionics', 'tank-baffle']
