export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { query, maxResults = 5 } = await req.json()
  const apiKey = process.env.TAVILY_API_KEY

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'TAVILY_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: maxResults,
      include_answer: true,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return new Response(
      JSON.stringify({ error: 'Search API error', detail: err }),
      { status: response.status, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const data = await response.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
}
