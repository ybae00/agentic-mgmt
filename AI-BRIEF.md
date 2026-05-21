# AI-BRIEF — Agentic Hardware Management Platform
> This is the master brief for building the prototype. Read this first. All other files in this folder go deeper on specific topics.

---

## What is this product?

A **management interface for AI agents** that perform complex hardware engineering work — think rocket development, robotics, nuclear plant design.

The core thesis: as AI agents get more capable, the human's role shifts from *doing the work* to *managing, reviewing, and approving what the agents do*. This is what a senior hardware engineer's workspace looks like in that future.

The agent can use tools like CAD software, Python/simulation code, Excel/data analysis, and engineering documentation. The user doesn't do the engineering — they oversee it.

---

## Who is the user?

**Persona: Senior Hardware Engineer**

- Oversees the entire scope of a complex hardware project (e.g., a launch vehicle)
- Does not write code or CAD themselves — they review, verify, approve
- Needs to trust the agent's work but also needs to be able to drill in and verify
- Comfortable with complexity; uncomfortable with chaos

**Mental model:** Think of a chief engineer at SpaceX who manages a team — except their team is AI agents running 24/7.

---

## The Core UX Concept

The app is a **canvas** — not a chat interface. It looks minimal and calm, but under the hood it's showing you the live graph of everything the agent is doing.

### Layout — three persistent elements on the canvas

1. **Left sidebar** — a narrow, tall floating panel. Lists each distinct "task session" as a history item. A new item appears every time the user starts a new, unrelated task. Clicking one lets you revisit its node graph.

2. **Prompt bar** — a centered, glassmorphic floating input. This is where the user tells the agent what to do. On first load it sits in the visual center of the screen. Once submitted, it slides down to the bottom, where it stays for follow-up prompts.

3. **Node graph canvas** — the main content area. Once the agent starts working, a connected graph of nodes appears and grows in real time, showing every action the agent is taking.

---

## The Node Graph — how it works

The node graph is the heart of the UI. It is inspired by Obsidian's graph view: nodes are draggable, hoverable, and clickable.

**Node structure logic:**
- Each "app" or "tool" the agent uses gets its own linear chain of nodes (e.g., CAD work flows top to bottom in one chain)
- When the agent opens a *new* tool/app, a new branch forks off from the current chain and runs in parallel
- Multiple branches can exist and grow simultaneously
- This means the graph grows both downward (linearly within a tool) and outward (branching across tools)

**Node states:**
- `active` — currently being worked on (subtle pulse animation)
- `complete` — done, no further action needed
- `needs-approval` — highlighted/alert color; the agent is blocked and needs the user to make a decision

**Hover behavior:**
When hovering a node, a small tooltip or popover appears with a plain-language description of what that task was (e.g., "Checked thruster gimbal geometry in CAD — clearances within spec").

---

## The Approval Flow

This is a critical interaction — the moment the product earns trust.

1. A node turns into an **alert state** (amber/warning color)
2. A small popover appears on the node with two buttons: **Approve** and **Investigate**
3. **Approve** — user confirms. The node resolves, agent continues.
4. **Investigate** — the screen splits. The left half shows the node graph (compressed). The right half reveals a simulated **desktop view** showing the exact app/screen that triggered the approval (e.g., a CAD model, a Python test result, a spreadsheet). The user can interact with it and then approve or reject.

---

## What the prototype needs to convey

This is NOT a working product. It is a **vibe prototype** — a scripted demo that makes you feel what it would be like to use the real thing.

The prototype needs to sell three feelings:
1. **Calm control** — the user is in charge even though agents are doing a lot
2. **Transparency without overwhelm** — you can see what's happening without being drowning in detail
3. **Trust moments** — the approval flow should feel meaningful, not like a boring confirm dialog

See `prototype-scope.md` for exactly what to build and what to fake.
See `demo-script.md` for the scripted sequence the prototype plays out.
See `design-spec.md` for the visual language.

---

## Tech stack recommendation

- **React + Vite** — component-based, fast iteration, plays well with Cursor
- **Framer Motion** — for node entrance animations, screen-split transition, prompt bar slide
- **CSS Modules or Tailwind** — for the glassmorphism styling
- **Custom SVG or React Flow** — for the node graph (React Flow is recommended for drag/connect behavior out of the box)
- **No backend** — everything is pre-scripted and triggered by user interaction

> If starting from scratch, scaffold with: `npm create vite@latest agentic-mgmt -- --template react`
