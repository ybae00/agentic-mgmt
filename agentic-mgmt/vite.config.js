import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Vite plugin that mounts /api/*.js files as middleware in dev mode.
// This lets us run the Vercel-style serverless functions locally
// without needing `vercel dev`. The same files deploy to Vercel as-is.
function apiPlugin() {
  return {
    name: 'local-api',
    async configureServer(server) {
      const apiDir = resolve(server.config.root, 'api')
      let handlers = {}

      try {
        const files = readdirSync(apiDir).filter((f) => f.endsWith('.js'))
        for (const file of files) {
          const route = '/api/' + file.replace(/\.js$/, '')
          const mod = await import(pathToFileURL(resolve(apiDir, file)).href)
          handlers[route] = mod.default
        }
      } catch (err) {
        console.warn('[local-api] No api directory or failed to load:', err.message)
      }

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`)
        const handler = handlers[url.pathname]
        if (!handler) return next()

        try {
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const body = chunks.length ? Buffer.concat(chunks) : undefined

          const request = new Request(`http://${req.headers.host}${req.url}`, {
            method: req.method,
            headers: req.headers,
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
          })

          const response = await handler(request)

          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))

          if (response.body) {
            const reader = response.body.getReader()
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              res.write(value)
            }
          }
          res.end()
        } catch (err) {
          console.error('[local-api] handler error:', err)
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Inject env vars into process.env so api handlers can access them.
  for (const key of ['ANTHROPIC_API_KEY', 'TAVILY_API_KEY']) {
    if (env[key]) process.env[key] = env[key]
  }
  return {
    plugins: [react(), apiPlugin()],
  }
})
