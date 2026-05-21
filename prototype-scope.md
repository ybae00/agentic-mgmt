# Prototype Scope — What to Build vs What to Fake

This is a vibe prototype. The goal is not correctness — it is *feeling*. A person using this for 2 minutes should walk away understanding the product and wanting it.

---

## What actually works (real interactions)

These are the things a user can actually do and get a real response from the UI:

| Interaction | What it does |
|---|---|
| Type in the prompt bar | Normal text input |
| Submit the prompt | Triggers the scripted demo sequence |
| Hover a node | Shows the node tooltip |
| Click a node in needs-approval state | Opens the approval popover |
| Click "Approve" | Resolves the node, the graph continues |
| Click "Investigate" | Triggers the screen split animation |
| Close the investigate panel | Returns to full canvas |
| Click a sidebar history item | Switches to that session's graph (can be a no-op or load a different pre-baked state) |

---

## What is faked / pre-scripted

Everything about the "agent working" is fake. There is no AI. There is no real CAD or Python.

| Element | How it's faked |
|---|---|
| Agent response text | A hardcoded string that types out after prompt submit |
| Node graph growing | Nodes appear on a timer, following the script in `demo-script.md` |
| Node branching | Hardcoded in the script — which nodes fork and when |
| "Active" node | Whichever node is currently "processing" per the timer |
| Needs-approval trigger | Specific nodes in the script are pre-marked as approval nodes |
| Investigate desktop view | A static screenshot or simple HTML mock of a CAD app / Python terminal / spreadsheet |
| Agent tool use | Not shown — only the node label indicates what tool was used |

---

## Prototype states / screens

### State 0 — Empty canvas (initial load)
- Left sidebar visible, empty (or with one placeholder item "New session")
- Prompt bar floating in center of screen
- No nodes visible
- Dark canvas background

### State 1 — After prompt submitted
- Prompt bar animates to bottom of screen
- Agent response text fades in above prompt bar
- Node graph begins appearing (per demo script)
- Left sidebar gains a new item: "Falcon 9 Review — now"

### State 2 — Graph growing (auto-plays)
- Nodes appear one by one on a timer (see demo-script.md for timing)
- Some nodes appear in parallel (branching)
- One branch stays active on CAD, another on Python, another on Docs

### State 3 — Approval needed
- One specific node turns amber/alert
- Popover appears: "Approve" / "Investigate"

### State 3a — Investigate
- Screen splits
- Right panel shows a fake CAD/app view

### State 4 — Approved, graph continues
- Remaining nodes resolve
- Graph completes
- Agent sends a final summary text above prompt bar

---

## Suggested component structure (React)

```
src/
  App.jsx                  — root layout, canvas
  components/
    Sidebar.jsx            — left task history panel
    PromptBar.jsx          — the input + submit
    AgentResponse.jsx      — the text above the prompt bar
    NodeGraph.jsx          — the SVG canvas + node rendering
    Node.jsx               — individual node component
    NodeEdge.jsx           — SVG bezier lines between nodes
    ApprovalPopover.jsx    — approve/investigate popup
    InvestigatePanel.jsx   — the right-side split desktop view
  data/
    demoScript.js          — the hardcoded sequence of nodes and timing
  styles/
    globals.css            — canvas bg, Inter font, resets
    glass.css              — reusable glassmorphism class
```

---

## What the demo-runner (demoScript.js) needs to do

The script is just a list of timed events. Each event says:
- At Xms after prompt submit: add this node
- Connect it to this parent node
- Give it this state (active / complete / needs-approval)
- When it completes: move to next

The demo should auto-advance. The only manual moments are:
1. The user submitting the prompt
2. The user clicking Approve or Investigate

Everything else is on a timer.

---

## Timing feel guidelines

- Nodes should not appear too fast — it should feel like the agent is *doing* something
- Roughly one new node every 1.5 to 3 seconds feels right
- Parallel branches (two growing simultaneously) feel impressive — make sure the demo has at least one moment where 2 branches grow at the same time
- The approval pause should feel like it matters — leave 2 seconds of silence before the amber node appears, so the user notices it

---

## Fake "desktop" content for Investigate view

The right panel in investigate mode should show a believable snapshot. Options (pick one):

**Option A — Static image:** A cropped screenshot of FreeCAD, Onshape, or a Python terminal with realistic-looking data. Label it in the panel header with the tool name.

**Option B — Simple HTML mock:** A minimal dark-themed "CAD viewer" with a wireframe SVG of a rocket nozzle or thruster geometry. Looks more custom but requires more work.

**Option C — Embedded iframe:** An actual publicly accessible web-based CAD viewer (like Onshape's public viewer) or a Jupyter notebook viewer. Risky — may not work offline or may look wrong.

Recommendation: **Option A** for speed, **Option B** for impressiveness.
