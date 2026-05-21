# Presentation Script — 5 Minutes
*~650 words. Deliver at a calm, unhurried pace.*

---

**[Slide: Full-bleed image. No text. Hold 3 seconds.]**

We are living in a moment where what we do ourselves is becoming less and less necessary.

You describe what you want. An agent goes off and does it. Step by step. On its own.

That feels like magic. But it raises a question nobody has cleanly answered yet.

---

**[Slide: Cursor reference]**

Cursor — a coding agent — recently made a big design decision. They hid the code editor. You don't see what the agent writes anymore. You just see the result.

Their argument: the future engineer doesn't write code. They review what the agent produced and decide if it ships.

I think they're right. But I think they stopped one step too short.

---

**[Slide: The question. Black background.]**

> "So what does the human actually do?"

---

That question is what drove this project. And I didn't find the answer sitting at my desk. I had to go look for it.

My first instinct was real-time collaboration — you and the AI working on something together, simultaneously. I built two experiments around that idea. A music tool where the AI generated sound as I played. A drawing tool where it recognized my sketches and extended them.

Both were interesting. Both taught me the same thing.

Simultaneous collaboration isn't really the answer. The AI moves faster than I do. The gap between what it can do in a given time and what I can do in that same time just keeps growing. Trying to keep up stops making sense.

The right model isn't working *with* it. It's directing what it does *for* you — and watching closely enough to catch it when it goes wrong.

---

**[Slide: "Who needs this most?"]**

So I asked: who already lives in that reality? Who works with massive complexity, across multiple tools, where one wrong step has real consequences?

A hardware engineer. Building a rocket. A satellite. A nuclear plant.

They work across CAD files, simulations, Excel data, Python scripts — all at once. Right now, to verify everything is working, they open every application manually. One by one.

With agents, you say: go check all of it. Find what's wrong. Fix what you can.

That's extraordinary. But then — do you trust it did it right? If the agent made a bad call in the CAD model, do you catch that before it affects the launch?

There's nothing in the market today that answers that question. You gave it instructions. Now you're flying blind.

---

**[Slide: The product. Dark canvas, prompt bar, empty.]**

This is what I think that interface looks like.

You prompt the agent. The prompt bar drops to the bottom. The agent starts working — and every action it takes becomes a node on this canvas. Connected. Structured. Readable at a glance.

When it opens a new tool, a new branch forks out. CAD. Simulation. Documentation. Running in parallel. You can see all of it without being overwhelmed by any of it.

And then — this.

**[Demo: Amber node. Pause.]**

The agent stops. It found something. The thrust chamber wall thickness is below spec — it can fix it, but the fix changes the mass budget. That's your call.

You click investigate. The screen splits. On the right: the exact screen the agent was looking at. You see what it saw. You make the decision. You approve.

The agent continues.

---

**[Slide: The opening question returns.]**

So — what does the human do, when the agent is doing the work?

They manage. They direct. They approve.

The engineer doesn't disappear. Their judgment becomes the most important thing in the room.

That needs an interface worthy of it.

This is mine. Thank you.

---

*Speaker note: The amber node pause and the investigate split are your two silence moments — don't fill them with words. Let the product speak.*
