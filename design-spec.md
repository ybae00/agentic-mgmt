# Design Spec — Agentic Hardware Management Platform

---

## Aesthetic in one sentence

Minimal, brutalist, dark — a tool that looks like it belongs in a mission control room, not a SaaS dashboard.

---

## Color palette

| Role | Value | Usage |
|---|---|---|
| Canvas background | `#0a0a0a` | The base — near black, not pure black |
| Surface / glass base | `rgba(255, 255, 255, 0.04)` | All floating panels and cards |
| Glass border | `rgba(255, 255, 255, 0.08)` | Borders on glass elements |
| Text primary | `#f0f0f0` | Main text |
| Text secondary | `rgba(240, 240, 240, 0.45)` | Labels, metadata, timestamps |
| Node default | `rgba(255, 255, 255, 0.12)` | Idle completed nodes |
| Node active | `#4a9eff` | Currently processing — blue |
| Node needs-approval | `#f5a623` | Requires user action — amber |
| Node complete | `rgba(255, 255, 255, 0.18)` | Done |
| Accent / CTA | `#4a9eff` | Approve buttons, active states |
| Danger | `#e05454` | Reject, error states |
| Edge / connector line | `rgba(255, 255, 255, 0.15)` | Lines between nodes |
| Edge active | `#4a9eff` at 40% opacity | Lines flowing toward active node |

---

## Typography

- **Font family:** `Inter` (via Google Fonts) — no fallback to system fonts, it must be Inter
- **Weights used:** 300 (light), 400 (regular), 500 (medium)
- **Do not use bold (700+)** — the aesthetic should feel calm, not loud

| Element | Size | Weight | Letter spacing |
|---|---|---|---|
| Sidebar task label | 12px | 400 | 0.01em |
| Node tooltip title | 13px | 500 | 0 |
| Node tooltip body | 12px | 300 | 0 |
| Prompt input text | 15px | 400 | 0 |
| Agent response text | 14px | 300 | 0 |
| Button label | 12px | 500 | 0.04em uppercase |
| Timestamp / meta | 11px | 300 | 0.02em |

---

## Glassmorphism — implementation reference

Every floating surface uses this treatment:

```css
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 6px;
```

Important: the canvas background should have a subtle texture or very faint noise to make the glass effect read properly. Use a `noise.svg` overlay at 3% opacity, or a CSS noise filter.

---

## Border radius

**Everything uses 6px.** No exceptions — nodes, panels, buttons, inputs, tooltips. This creates a consistent visual rhythm.

---

## Spacing system

Based on an 8px grid.

- `4px` — tight internal spacing (icon to label gap)
- `8px` — small (padding inside compact elements)
- `12px` — default padding inside nodes and tooltips
- `16px` — standard panel padding
- `24px` — section separation
- `32px` — large gaps between floating elements

---

## Component specs

### Prompt Bar
- Width: `560px` centered, or `calc(100vw - 64px)` max on smaller screens
- Height (idle): `52px`
- Padding: `16px` horizontal
- Glass surface with 6px radius
- Placeholder text: `"What should the agent work on?"` in secondary text color
- On focus: border glows subtly — `border: 1px solid rgba(74, 158, 255, 0.35)`
- Send button: icon only (arrow), 32x32px, appears on input
- On submit: animate from vertical center to bottom `24px` from viewport bottom edge — use spring animation, not linear

### Left Sidebar
- Width: `220px`
- Full viewport height, floating with `24px` margin from left and top
- No close button — it is always visible
- Each task item: `12px` font, `36px` height, left-border accent on active item
- Active item left border: 2px solid `#4a9eff`

### Node
- Size: approximately `160px` wide, `44px` tall (pill shape / rounded rect)
- Label: task name in 12px, truncated with ellipsis if too long
- State indicator: a 6px circle on the left of the label
  - active: blue, pulsing
  - complete: white at 40% opacity
  - needs-approval: amber, pulsing
- On hover: elevate shadow, show tooltip below/above
- Tooltip: glass surface, max-width 280px, task description in 12px/300 weight

### Node connector lines
- SVG paths between nodes (bezier curves)
- Stroke: `rgba(255, 255, 255, 0.15)`, `1.5px` wide
- Active edge (leading to current node): `#4a9eff` at 40%, animated dash flow

### Approval popover
- Appears attached to needs-approval node
- Two buttons: "Approve" (primary, blue fill) and "Investigate" (ghost, white border)
- Button height: `32px`, padding `12px` horizontal
- Font: 12px, 500 weight, uppercase, 0.04em letter spacing

### Investigate — screen split
- Triggered by clicking "Investigate"
- The existing canvas panel slides/compresses to the left half of the screen
- The right half slides in from the right — a simulated desktop view (dark window chrome, an embedded iframe or static image showing the relevant app)
- Transition: spring animation, 400ms
- A close/collapse button at the top right of the split view returns to full canvas

### Agent response text
- Appears above the prompt bar (which has moved to the bottom)
- Text fades in word by word (typewriter effect is acceptable but not required — fade-in is better)
- Top of the text area has a `linear-gradient` from `#0a0a0a` to transparent, making old text dissolve upward
- Max visible area: about 3 lines before gradient cutoff

---

## Animation principles

- **Always use spring physics** (not linear or ease-in-out) for spatial transitions — elements should feel physical
- **Nodes appear** with a subtle scale-in and fade: `scale 0.85 -> 1`, `opacity 0 -> 1`, 200ms spring
- **Active pulse** on nodes: subtle `box-shadow` breathing, 2s loop
- **Nothing should be instant** — even micro-interactions get at least 150ms
- **Screen split** is the biggest animation in the product — it should feel cinematic, not jarring. Use a slow spring (500ms, low damping)

---

## What NOT to do

- No gradients on text
- No rounded corners larger than 6px
- No animations above 600ms (except screen split)
- No color other than the palette above
- No drop shadows on nodes — use the glass border instead
- No sans-serif font other than Inter
- No loading spinners — use the active node pulse instead
