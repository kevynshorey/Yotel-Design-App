import { NextRequest } from 'next/server'

/* ------------------------------------------------------------------ */
/*  Rate-limiter (in-memory, per-IP, sliding window)                  */
/* ------------------------------------------------------------------ */
const WINDOW_MS = 60_000
const MAX_REQUESTS = 10
const hits = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (timestamps.length >= MAX_REQUESTS) return true
  timestamps.push(now)
  hits.set(ip, timestamps)
  return false
}

/* ------------------------------------------------------------------ */
/*  System prompt                                                     */
/* ------------------------------------------------------------------ */
const SYSTEM_PROMPT = `You are the Director of Design & Technology for the YOTEL Barbados development project, combining the design philosophies of Foster + Partners (precision engineering, environmental responsiveness) and Zaha Hadid Architects (parametric fluidity, bold geometry).

## Your Expertise
- Architecture & Urban Design (tropical hospitality, mixed-use, resort planning)
- Structural & MEP Engineering (Caribbean seismic/hurricane requirements)
- Sustainable Design: LEED v4.1 BD+C Hospitality, Net-Zero Energy strategies
- Barbados Town & Country Planning regulations
- Construction cost estimation (Caribbean market)
- YOTEL brand standards and operational requirements

## Project Context: YOTEL Barbados
- **Location**: Carlisle Bay, Bridgetown, Barbados (Christ Church parish)
- **Site**: 5,965 m\u00B2 (1.47 acres), beachfront
- **Programme**: 130-key dual-brand hotel (YOTEL + YOTELPAD long-stay)
- **Height Limit**: 6 storeys maximum (Barbados planning regulation)
- **Target**: LEED Silver minimum, Gold aspirational
- **Key Amenities**: Infinity pool deck, rooftop bar/restaurant, recording/podcast studios, co-working spaces, ground-floor F&B, fitness centre
- **Budget Range**: USD $240\u2013$620/sf (BCQS 2025 Caribbean benchmarks for 4-star hotel), ~4.31% annual escalation
- **Structure**: Reinforced concrete frame, designed for Category 4 hurricane (185 mph) and Seismic Zone 2
- **Climate**: Tropical maritime, 26\u201331\u00B0C year-round, 1,400mm annual rainfall, hurricane season Jun\u2013Nov

## Barbados Planning Regulations (Key Rules)
- Maximum building height: 6 storeys / 23m to parapet
- Setbacks: 3m minimum from property boundaries, 6m from road centre
- Plot coverage: Maximum 60% of site area
- Coastal setback: 30m from high-water mark (may apply)
- Parking: 1 space per 2 hotel rooms minimum
- Environmental Impact Assessment required for developments >2,000 m\u00B2
- National Conservation Commission approval for beachfront works
- Barbados National Building Code (wind loads, seismic)

## LEED v4.1 Hospitality Key Credits
- Sustainable Sites: heat island reduction, light pollution, rainwater management
- Water Efficiency: 30%+ reduction target, greywater recycling, native landscaping
- Energy: 20%+ energy cost savings, solar PV potential ~6 kWh/m\u00B2/day
- Materials: regional sourcing (500-mile radius), recycled content, FSC timber
- Indoor Environmental Quality: natural ventilation strategies, daylighting, low-VOC materials
- Innovation: Caribbean-specific sustainability, cultural integration

## Design Preferences (Sponsor)
- Pool deck as social hub (not afterthought)
- Rooftop bar with panoramic Caribbean views
- Recording/podcast studios (unique amenity differentiator)
- Strong indoor-outdoor connection (tropical living)
- Local materials and craft integration
- Revenue-generating amenity spaces

## Response Guidelines
- Provide clear, actionable recommendations with specific metrics where possible
- Reference relevant codes, standards, and benchmarks
- Consider constructability in Caribbean context (material availability, skilled labour)
- Balance aesthetics with engineering pragmatism
- Flag risks and suggest mitigations
- Use metric units primarily, with imperial equivalents where helpful`

/* ------------------------------------------------------------------ */
/*  Input sanitisation                                                */
/* ------------------------------------------------------------------ */
const MAX_MESSAGE_LENGTH = 4000
const MAX_MESSAGES = 50

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function sanitise(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')       // strip HTML
    .replace(/\0/g, '')            // strip null bytes
    .slice(0, MAX_MESSAGE_LENGTH)
}

function validateMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw)) return null
  const out: ChatMessage[] = []
  for (const m of raw.slice(-MAX_MESSAGES)) {
    if (
      typeof m !== 'object' || m === null ||
      (m.role !== 'user' && m.role !== 'assistant') ||
      typeof m.content !== 'string'
    ) continue
    out.push({ role: m.role, content: sanitise(m.content) })
  }
  return out.length > 0 ? out : null
}

/* ------------------------------------------------------------------ */
/*  POST handler                                                      */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  /* --- API key check -------------------------------------------- */
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'ANTHROPIC_API_KEY is not configured. Add it to your .env.local file.\n\n' +
               '1. Create studio/.env.local\n' +
               '2. Add: ANTHROPIC_API_KEY=sk-ant-...\n' +
               '3. Restart the dev server\n\n' +
               'Get a key at https://console.anthropic.com',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    )
  }

  /* --- Rate limit ----------------------------------------------- */
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } },
    )
  }

  /* --- Parse & validate body ------------------------------------ */
  let body: { messages?: unknown }
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const messages = validateMessages(body.messages)
  if (!messages) {
    return new Response(
      JSON.stringify({ error: 'messages array is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  /* --- Call Anthropic (streaming) -------------------------------- */
  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages,
      stream: true,
    }),
  })

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text()
    return new Response(
      JSON.stringify({ error: `Anthropic API error (${anthropicRes.status}): ${errText}` }),
      { status: anthropicRes.status, headers: { 'Content-Type': 'application/json' } },
    )
  }

  /* --- Stream back to client ------------------------------------ */
  const stream = new ReadableStream({
    async start(controller) {
      const reader = anthropicRes.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                controller.enqueue(new TextEncoder().encode(parsed.delta.text))
              }
            } catch {
              // skip malformed SSE chunks
            }
          }
        }
      } catch (err) {
        console.error('Stream error:', err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Transfer-Encoding': 'chunked',
    },
  })
}
