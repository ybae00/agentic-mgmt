# Deployment — Vercel

The prototype is a static React app with no backend. Vercel handles this perfectly with zero configuration.

---

## Setup (one time)

1. Scaffold the project if you haven't already:
   ```bash
   npm create vite@latest agentic-mgmt -- --template react
   cd agentic-mgmt
   npm install
   ```

2. Install dependencies:
   ```bash
   npm install framer-motion @xyflow/react
   ```
   - `framer-motion` — for all animations (node entrance, prompt bar slide, screen split)
   - `@xyflow/react` — formerly React Flow; handles the draggable node graph

3. Add a `vercel.json` to the project root:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
   This ensures client-side routing works when someone navigates directly to a URL.

4. Push to GitHub (Vercel deploys from a repo):
   ```bash
   git init
   git add .
   git commit -m "init"
   gh repo create agentic-mgmt --public --push --source=.
   ```

5. Go to [vercel.com](https://vercel.com), import the repo, and deploy. No environment variables needed — the app is fully static.

---

## Every deploy after that

Just push to `main`. Vercel auto-deploys on every push.

For sharing a specific iteration before merging:
- Push to a feature branch — Vercel creates a preview URL for every branch automatically
- Share that URL for feedback; merge when ready

---

## Implications for the "Investigate" panel

Since this is deployed to a public URL, the fake desktop view in the Investigate panel cannot use `localhost` iframes. Options:

**Recommended: Static image** — Use a high-quality screenshot of a CAD tool (e.g., Onshape, FreeCAD, Fusion 360) with a red highlight drawn over the offending geometry. Host the image in `public/` and reference it as `/cad-screenshot.png`. Fast, always works, looks good.

**Alternative: Inline SVG mock** — Build a minimal SVG rocket cross-section directly in the `InvestigatePanel.jsx` component. No external dependency, works offline, and looks more custom. The downside is more upfront work.

Either way, the panel header should show the app name ("CAD — Falcon 9 Assembly v4.1") and a fake file path to sell the illusion.

---

## Vercel project settings

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |
| Node version | 18.x |

These are all auto-detected by Vercel for a Vite project. You shouldn't need to set them manually.

---

## Custom domain (optional)

If you want a clean URL for demos (e.g., `agentic.yoon.dev`):
- Add the domain in Vercel's project settings under "Domains"
- Point your DNS CNAME to `cname.vercel-dns.com`

Otherwise the default `agentic-mgmt.vercel.app` works fine for sharing.
