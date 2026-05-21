# Presentation Story Structure
*Based on your Obsidian notes — reorganized for clarity and narrative momentum*

---

## The problem with the current flow

Your raw notes contain all the right ingredients. The ideas are strong. But right now the story jumps between three different things — your personal journey, the industry argument, and the product — without a clear order. The GUI counter-argument shows up before you've even explained what agents are. The hardware engineer (your strongest, most specific material) arrives too late. And the personal OS demo at the end deflates the energy right before you close.

The fix is simple: three acts, each with one job.

---

## The restructured story — three acts

---

### ACT 1 — The world has shifted (2-3 minutes)
*Job: establish the new reality, fast*

**Beat 1 — Open with the feeling, not the explanation**
Start with the magic. "We are now living in a world where what we actually do ourselves becomes less and less complicated. You prompt something, and it happens. It feels like magic."

Don't explain AI yet. Just establish the feeling.

**Beat 2 — One sentence on what agents actually are**
"AI started as a prediction machine. Now it reasons. And now it acts — on its own. You give it a goal and it goes off and does it. That's an agent."

Keep this short. The audience doesn't need a technical lecture. One paragraph maximum.

**Beat 3 — The industry signal: Cursor**
"The engineering world is already changing. Cursor, a coding agent, recently made a big design decision: they hid the code editor. You don't see what the agent writes anymore. You only see the result."

"They argue the future engineer doesn't write syntax — they review what the agent produced and decide if it ships."

This is your external validation. It tells the audience: this isn't just your theory, the industry is moving here.

**Beat 4 — The question that drives everything**
"So here's the question I've been sitting with: if agents are doing the work, what does the human actually do?"

Land this hard. Pause. This question is the spine of the whole talk.

---

### ACT 2 — My search for the answer (4-5 minutes)
*Job: take the audience on your personal journey — make them feel how you arrived at the insight*

**Beat 5 — I started with real-time collaboration**
"My first instinct was: maybe the future is humans and AI working simultaneously, side by side. So I built some experiments."

**Beat 6 — Experiment 1: the music composer**
Describe the musical friend project. You'd play, it would generate in real time. Show it briefly if you have footage.

"It was compelling. But something felt off."

**Beat 7 — Experiment 2: drawing with AI**
Describe the drawing project. Draw a butterfly, it recognizes and extends. Show it.

"Again — interesting. But again, something felt off."

**Beat 8 — The conclusion from those experiments**
"Here's what I realized: simultaneous real-time collaboration with AI isn't really the answer. The AI still needs time to think. And more importantly — as AI gets more capable, the gap between what it can do and what I can do in the same time just keeps growing. Trying to keep up with it stops making sense."

"The right model isn't doing things *with* it. It's overseeing what it does *for* you."

This is your pivot. This is the moment the audience understands where you're going.

**Beat 9 — The nuance: when you DO want to see what the agent is doing**
This is your best argumentative beat — don't bury it.

"Now, Cursor's approach — hide everything, just show results — works fine when the task is simple. Draft an email. Schedule a meeting. Sure, I don't need to see every step.

But what about when one wrong step kills everything? What about when the task has a million steps, involves safety-critical systems, and if one agent makes a bad call, the whole thing falls apart?

In that case, you don't want less visibility. You want *the right kind* of visibility."

---

### ACT 3 — The product (5-6 minutes)
*Job: show the answer, make it concrete, leave them with a clear image*

**Beat 10 — The user: a hardware engineer**
"So I asked myself: who needs this most? Who is already managing enormous complexity across multiple tools, where a single error can cost millions or lives?"

"A hardware engineer. Building a rocket. A satellite. A nuclear plant."

"They work across CAD files, Python simulations, Excel data, test results, GitHub — all at once. Right now, to verify everything is working, they have to open every single application manually and check. One by one."

"With agents, you can tell it to check all of it. But then: do you trust it did it right? Do you know if it went off track? If one agent made a wrong call — do you catch it before it matters?"

**Beat 11 — The market gap**
"There's nothing in the market today that lets you oversee what your agents are doing. You gave it instructions. Now you're flying blind."

"That's the problem I'm building for."

**Beat 12 — The product reveal**
Show the prototype (or screenshots).

Walk through it with restraint:
- The canvas. The prompt bar.
- "You tell the agent what to do."
- The node graph grows. "You can see every step it's taking. Not a log file. Not a terminal. A visual, structured map of its work."
- Multiple branches. "CAD. Simulation. Documentation. Running at the same time."
- The amber node. Pause. "And when it needs you — it stops and waits."
- The investigate panel. "You can look into exactly what it's seeing and decide."

"This is what oversight looks like."

**Beat 13 — Brief: the personal OS demo** *(optional — cut if time is tight)*
"And this isn't just for aerospace. I built a small version for everyday life — a personal OS with basic apps. I prompt it. It goes to my website, reads my profile, writes a summary into my Notes. And I can watch every step it takes to do it."

Use this only if it makes the product feel more accessible. If the hardware engineer story is landing well, skip it — it can dilute the specificity.

**Beat 14 — The close**
Return to the question from Act 1.

"So — what does the human do, when the agent is doing the work?"

"They manage. They direct. They investigate. They approve."

"The engineer doesn't disappear. They step up. Their job becomes judgment — and judgment needs an interface."

"This is mine."

---

## What changed and why

| Original flow | Restructured flow | Why |
|---|---|---|
| GUI counter-argument early | Moved to Beat 9 (nuanced, specific) | The GUI point is weak as a standalone argument; it's powerful when it's *your* counterpoint to Cursor's approach |
| Cursor reference mid-story | Moved to Act 1 | It's industry evidence — it belongs in setup, not after your personal journey |
| Personal experiments scattered | Consolidated in Act 2 | They're your narrative proof of concept — they need to feel like a journey, not digressions |
| Hardware engineer late | Moved to Act 3 opening | This is your strongest concrete material — the audience needs it before the demo |
| OS demo as the final demo | Optional, after hardware demo | The hardware case is more impressive; the OS demo risks making the product feel smaller |
| Abrupt close | Callback close | Return to the opening question for a complete arc |

---

## One sentence per act (to memorize the structure)

- **Act 1:** The world changed and nobody knows what the human does now.
- **Act 2:** I tried to figure it out, and here's what I learned.
- **Act 3:** Here's my answer.
