# Presentation Script
*Estimated delivery time: 18-22 minutes*
*Tone: Calm, personal, argumentative — not a hype talk*

---

## ACT 1 — The world has shifted

---

**[Slide: Full-bleed image. No text. A launch vehicle on the pad, or a dark circuit board, or a rocket nozzle in cross-section. Hold for 5 seconds of silence.]**

---

We are living in a moment where what we actually do ourselves is becoming less and less necessary.

Not long ago, if you wanted something built — a piece of software, a document, a data analysis — you had to sit down and build it yourself. Line by line. Step by step.

Now you describe what you want, and something goes off and does it for you.

That feels like magic. And I think most of us are still kind of in shock about it.

---

**[Slide: "What is an agent?"]**

---

Let me quickly define what I mean when I say agent, because it matters for everything I'm about to show you.

AI started as a language model. A really powerful autocomplete — it was trained on so much text that it got incredibly good at predicting what comes next. And at some point, that prediction became precise enough that it could actually reason.

And then we took that reasoning and gave it tools. The ability to browse the web. Open files. Write code. Send requests. Run simulations.

Now when you give it a goal, it doesn't just respond — it goes off and works toward that goal. Step by step. On its own. That's an agent.

You tell it what you want. It figures out how to get there.

---

**[Slide: Cursor logo or the Cursor interface — clean, minimal]**

---

Now here's what made me start paying very close attention to this.

Cursor — if you don't know it, it's a coding tool built around AI agents — recently made a design decision that I think says a lot about where we're headed.

They removed the code editor.

Not technically. But in terms of what the user sees — you don't watch the agent write code anymore. You prompt it, and you see the result. The actual decisions it made, the lines it changed, the logic it applied — all of that is hidden by default.

Their argument is: the engineer of the future doesn't want to see every step. They want to see what shipped.

And they backed this up with something even bigger. They published a video arguing that the entire engineering industry is changing. That codebases are going to be AI-generated and AI-managed. That the engineer's job is shifting from writing code to reviewing what the agent produced and deciding whether it's safe to deploy.

I found this really compelling. And also — slightly incomplete.

But I'll get to that.

---

**[Slide: One question. Black background. White text.]**

> "So what does the human actually do?"

---

Because here's the thing. If agents are doing the work — if the code is being written, the files are being generated, the decisions are being made — what is the human's role?

That question is what this whole project is about.

And I didn't find the answer immediately. I had to go looking for it.

---

## ACT 2 — My search for the answer

---

**[Slide: Blank or transitional — "The experiments"]**

---

My first instinct was that the future of human-AI interaction is real-time collaboration. You and the AI working on something together, simultaneously, like two people at the same table.

So I started building experiments to test that idea.

---

**[Slide: The music project — a screenshot or short clip]**

---

The first one was a music tool. I built what I'd call a musical friend — something where you could play notes on a keyboard and the AI would generate sounds and visuals in real time as you played. A kind of live creative collaboration.

It was genuinely interesting to use. There was something exciting about it.

But I kept noticing something. The collaboration felt uneven. I was playing, and the AI was reacting. But we weren't really building something *together*. I was still doing the creating. It was just making the experience richer.

---

**[Slide: The drawing project — a screenshot or short clip]**

---

The second experiment was drawing. I built something where I could sketch on a canvas — draw the rough shape of a butterfly, for example — and the AI would recognize what I was trying to draw and extend it, complete it, add to it in real time.

Again — technically impressive. Visually interesting.

But the same problem. The AI was reacting to me, not working with me. And more importantly: the AI still needed time. Even in "real time," there was always a gap between what I did and what it could do with it.

Simultaneous, live, equal collaboration — it's not really possible yet. And honestly, I started to think: maybe that's not even the right goal.

---

**[Slide: A single line — "The model isn't doing it *with* it. It's overseeing what it does *for* you."]**

---

Here's the conclusion I came to.

As AI gets more capable, the gap between what it can do in a given amount of time and what I can do in that same time keeps growing. The AI gets faster, handles more, works across more tools simultaneously. Me trying to keep up with that — to collaborate in real time — stops making sense.

The right model isn't working alongside it. It's stepping back and directing it. Watching what it does. Verifying it. Stepping in when it needs you.

The human role isn't doing less — it's doing something *different*. Something that only humans can do at this level of complexity. Judgment. Oversight. Approval.

And that's where Cursor's approach — which I really do think is right for simple tasks — starts to show its limits.

---

**[Slide: "When do you actually want to see what the agent is doing?"]**

---

Think about a simple task. An agent drafts an email for you. Does it matter if you see every word it considered before landing on the one it chose? No. Just show me the email. I'll read it and send it.

Fine. Hide the process. I agree.

But now think about a different kind of task.

An agent is checking whether a rocket's propulsion system is correctly modeled in the CAD file, cross-referencing that against the simulation data, and flagging anything that's out of tolerance.

There are hundreds of steps. Each step depends on the one before it. If the agent makes one wrong assumption early on — and you don't catch it — everything downstream is built on a bad foundation.

In that case, you don't want less visibility. You want the *right kind* of visibility. You want to be able to see what it's doing, trust that it's on track, and step in the moment something looks wrong.

That's the design problem nobody has solved yet. And it's the one I'm trying to solve.

---

## ACT 3 — The product

---

**[Slide: "Who needs this most?"]**

---

So I asked myself: who is already living in this reality? Who is working with enormous complexity, across multiple tools, where a single error has real consequences — and where AI agents are going to change everything about how they work?

A hardware engineer.

Someone building a rocket. A satellite. An autonomous vehicle. A nuclear plant.

These are systems where everything has to be right. The CAD geometry has to be right. The software has to be right. The simulation has to match the physical model. The test data has to be interpreted correctly. And all of this lives across completely different tools — CAD software, Python scripts, Excel files, GitHub repositories, documentation systems — none of which talk to each other naturally.

Right now, to verify that everything is working as planned, an engineer has to open every single one of those applications. One by one. Manually. Check it, close it, open the next one.

With agents, you can say: go check all of it. Find anything that's wrong. Fix what you can. Flag what you can't.

That's extraordinary. But then what?

Do you trust it did it right? Do you know if it went off track? If one agent made a bad call in the CAD model — do you catch that before it affects the simulation? Before it affects the test? Before it affects the launch?

---

**[Slide: "There is nothing in the market today that lets you oversee what your agents are doing."]**

---

You gave the agents their instructions. Now you're flying blind.

That's the gap. And that's what I'm building for.

---

**[Slide: The product — first look. Dark canvas, prompt bar centered, empty. No annotations yet.]**

---

This is what I think that interface looks like.

---

**[Hold the slide for 3-4 seconds. Let them look at it.]**

---

It's a canvas. Not a chat window. Not a dashboard. A canvas.

There's a prompt bar in the center — that's where you tell the agent what to do. And that's almost the only thing on screen when you arrive. Calm. Empty. Ready.

Let me show you what happens next.

---

**[Demo: Type the prompt or show it pre-filled]**

> *"Check the Falcon 9 launch vehicle — verify the CAD geometry, run the thrust simulation, and make sure the documentation is up to date. Fix anything that's off."*

---

You send it. And watch what happens to the interface.

---

**[Demo: Prompt bar slides to the bottom. Agent response text fades in above it.]**

---

The prompt bar drops to the bottom of the screen. The agent responds — not with a wall of text, but with a short confirmation of what it's going to do.

And then it starts working.

---

**[Demo: Node graph begins growing. First node appears, then branches.]**

---

This is the node graph. Every action the agent takes becomes a node. And the nodes connect — so you can see not just what it did, but in what order, and why one step led to the next.

Watch what happens when it needs to open a new tool.

---

**[Demo: Second branch forks out — simulation branch, then docs branch.]**

---

CAD on one branch. The thrust simulation on another. Documentation on a third.

Three different applications. Three different agents. Running simultaneously.

This is what the agent is actually doing right now — and you can see all of it, structured, without being overwhelmed by it. You can scan this in two seconds or drill into any node for as long as you want.

---

**[Demo: Amber node appears. Graph pauses.]**

---

And then this happens.

---

**[Pause. Let the amber node sit on screen for a moment.]**

---

The agent stops. Something needs your attention.

The thrust chamber wall thickness in the CAD model is below the minimum specification. The agent can fix it — but fixing it will change the mass budget of the vehicle. That's a decision a human needs to make.

You have two options.

You can approve. The agent updates the geometry and continues.

Or you can investigate.

---

**[Demo: Click "Investigate." Screen splits. Right panel slides in showing the CAD view.]**

---

The screen splits. The node graph compresses to the left. On the right — the exact screen the agent was looking at when it flagged the issue. The CAD model. The wall in question, highlighted.

You can look at it yourself. Ask the agent questions about it. Understand *why* it flagged it and *what* the fix would mean.

And then you make the call.

---

**[Demo: Click "Approve." Graph resumes. Remaining nodes complete.]**

---

You approve. The agent makes the correction, continues through the remaining checks, and finishes.

Everything the agent did — every decision, every file it touched, every result it produced — is here in this graph. Permanent. Reviewable. Auditable.

---

**[Slide: Final summary node on graph. All complete.]**

---

This is what oversight looks like.

Not a log file. Not a terminal. Not a chatbot you interrogate after the fact.

A living map of what the agent is doing, with the ability to step in exactly when and where it matters.

---

**[Slide: Black. The opening question returns.]**

> "So what does the human actually do?"

---

I've been thinking about this question for a long time now.

And here's my answer.

The human manages. Directs. Investigates. Approves.

The engineer doesn't disappear just because the agent is doing the engineering. If anything, their role becomes more important — because the consequences of a bad decision get larger as the system gets more autonomous.

What changes is *how* they work. They're no longer the ones opening every file, running every check, writing every line. They're the ones who understand the whole — who can look at what the agent did and know whether it's right.

That requires a different interface. Not the ones we have today.

This is mine.

Thank you.

---

## Speaker notes

**On pacing:**
Act 1 should feel confident and controlled — you're establishing the world, not selling anything yet. Don't rush the Cursor section. It's your strongest external proof point.

Act 2 is where you slow down and get personal. The experiments should feel like genuine reflection, not product backstory. Let the "wrong model" moment land before you move on.

Act 3 is where the energy picks up slightly — but still calm. The demo should breathe. The biggest mistake in demos is narrating every beat. Let the amber node sit in silence for a full second before you say anything about it. That silence does more than your words will.

**On the demo:**
If live, have the prototype open and ready before you walk on. Do not switch tabs or open a browser mid-talk.
If recorded, the recording should be high-quality and have no UI chrome visible — just the product.

**The investigate moment is the peak.**
Everything in the talk builds to the screen split. Don't rush into it. Don't explain it before it happens. Let the animation play, let the audience process what they're seeing, then describe it.

**The close:**
Do not add anything after "Thank you." The callback to the opening question is the close. Anything after it is noise.
