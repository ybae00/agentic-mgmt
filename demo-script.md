# Demo Script — The Scripted Agent Walkthrough

This file defines the exact sequence of events that plays out after the user submits a prompt. Everything here is hardcoded into `demoScript.js`.

---

## The prompt

The user types (or this is pre-filled as a hint):

> "Check the Falcon 9 launch vehicle — verify the CAD geometry, run the thrust simulation, and make sure the documentation is up to date. Fix anything that's off."

---

## Agent response text (appears above prompt bar)

Fade in, word by word or line by line:

> "Got it. I'll review the CAD geometry, run the thrust chamber simulation, and cross-check the documentation. I'll flag anything that needs your sign-off."

---

## Node sequence

Each entry below represents one node appearing on the canvas. Timing is relative to prompt submit (t=0).

### Root node
| t | Node label | State | Parent | Branch |
|---|---|---|---|---|
| 0.5s | "Task started" | complete | — | root |

---

### Branch A — CAD Review
| t | Node label | State | Parent | Notes |
|---|---|---|---|---|
| 1.5s | "Open CAD — Falcon 9 assembly" | active → complete | root | First branch spawns |
| 3.5s | "Load thruster geometry" | active → complete | above | |
| 5.5s | "Check gimbal clearances" | active → complete | above | |
| 7.5s | "Measure nozzle exit radius" | active → complete | above | |
| 9.5s | "Flag: thrust chamber wall thickness below spec" | **needs-approval** | above | This is the approval node |

The graph pauses here. The amber node appears. Popover shows:

> **Agent needs your approval**
> The thrust chamber wall thickness in the CAD model is 2.1mm — below the 2.5mm minimum specified in the design doc. I can update the geometry automatically, but this will change the mass budget.
> **Approve** / **Investigate**

If user clicks **Investigate**, the screen splits and shows a fake CAD view of the thruster with the offending wall highlighted in red.

If user clicks **Approve**, node resolves to complete and the chain continues.

| t (after approval) | Node label | State | Parent |
|---|---|---|---|
| +1s | "Update wall thickness to 2.5mm" | active → complete | approval node |
| +2.5s | "Regenerate mesh" | active → complete | above |
| +3.5s | "CAD review complete" | complete | above |

---

### Branch B — Thrust Simulation (spawns at t=3s, runs in parallel with Branch A)
| t | Node label | State | Parent | Notes |
|---|---|---|---|---|
| 3s | "Open Python — thrust_sim.py" | active → complete | root | Second branch, parallel |
| 5s | "Load propellant parameters" | active → complete | above | |
| 7s | "Run Isp calculation" | active → complete | above | |
| 9s | "Run chamber pressure model" | active → complete | above | |
| 11s | "Simulation complete — results nominal" | complete | above | No approval needed |

---

### Branch C — Documentation (spawns at t=4s, runs in parallel)
| t | Node label | State | Parent | Notes |
|---|---|---|---|---|
| 4s | "Open Docs — design_spec_v4.docx" | active → complete | root | Third branch |
| 6s | "Check revision history" | active → complete | above | |
| 8s | "Update CAD reference numbers" | active → complete | above | |
| 10s | "Documentation sync complete" | complete | above | |

---

### Final summary node (after all branches resolve)
| t (after all complete) | Node label | State | Parent |
|---|---|---|---|
| +1s | "All tasks complete" | complete | root |

---

## Final agent response text

After the summary node appears, the text area above the prompt bar updates:

> "Done. CAD geometry updated — wall thickness corrected to 2.5mm. Thrust simulation nominal at 854 kN sea-level thrust. Documentation updated to rev 4.1. No other issues found."

---

## Visual layout of the graph

The graph should be laid out roughly like this (approximate positions — the AI building this can decide exact coordinates):

```
         [Task started]
               |
    ┌──────────┼──────────┐
    |          |          |
[CAD branch] [Sim branch] [Docs branch]
  (linear     (linear      (linear
  downward)   downward)    downward)
    |
  ... nodes ...
    |
[APPROVAL NODE] ← amber, pulsing
    |
  ... continues after approval ...
    |
[CAD complete]

         [All tasks complete]  ← connected to all three branch ends
```

The three branches should grow visually to the left, center, and right of the canvas (CAD on left, Sim in center-right, Docs on right).

---

## Timing control in code

In `demoScript.js`, structure each event as:

```js
{
  id: 'node-a1',
  label: 'Open CAD — Falcon 9 assembly',
  delay: 1500,           // ms from prompt submit
  parent: 'root',
  branch: 'cad',
  initialState: 'active',
  completesAfter: 2000,  // ms after appearing, transitions to complete
  needsApproval: false,
}
```

For the approval node, set `needsApproval: true` and `completesAfter: null` — it waits for user action.

Subsequent nodes in a branch that comes after an approval node should have their timers paused until the approval resolves.

---

## Notes for the builder

- The demo should feel like it is running for about 30-45 seconds total before everything resolves
- The parallel branches growing simultaneously is the most impressive visual moment — make sure it reads clearly
- The approval node is the emotional peak — the transition into Investigate view is what the whole demo builds toward
- Do not skip the graph layout math — sloppy node positions will make the whole thing look broken
