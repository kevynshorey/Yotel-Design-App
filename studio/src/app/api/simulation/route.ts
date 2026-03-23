import { NextRequest } from 'next/server'

import { generateSimulationPayload, mapToLadybugScenario } from '@/lib/simulation-connectors'
import type { DesignOption } from '@/engine/types'

/* ------------------------------------------------------------------ */
/*  Rate-limiter (in-memory, per-IP, sliding window)                  */
/* ------------------------------------------------------------------ */
const WINDOW_MS = 60_000
const MAX_REQUESTS = 20        // simulation payloads are read-heavy, generous limit
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
/*  Input sanitisation & validation                                   */
/* ------------------------------------------------------------------ */
const MAX_BODY_LENGTH = 50_000   // 50 KB max body

function sanitiseString(text: string, maxLen: number): string {
  return text
    .replace(/<[^>]*>/g, '')     // strip HTML
    .replace(/\0/g, '')          // strip null bytes
    .slice(0, maxLen)
}

/** Minimal shape validation for DesignOption fields used by simulation. */
function validateOptionShape(raw: unknown): { valid: true; option: DesignOption } | { valid: false; error: string } {
  if (typeof raw !== 'object' || raw === null) {
    return { valid: false, error: 'Request body must be a JSON object with an "option" field' }
  }

  const obj = raw as Record<string, unknown>

  // Required top-level fields
  if (typeof obj.id !== 'string' || obj.id.length === 0) {
    return { valid: false, error: 'option.id must be a non-empty string' }
  }

  // Sanitise id
  obj.id = sanitiseString(obj.id, 100)

  // Params validation
  if (typeof obj.params !== 'object' || obj.params === null) {
    return { valid: false, error: 'option.params is required' }
  }

  const params = obj.params as Record<string, unknown>
  if (typeof params.storeys !== 'number' || params.storeys < 1 || params.storeys > 20) {
    return { valid: false, error: 'option.params.storeys must be a number between 1 and 20' }
  }

  // Wings validation
  if (!Array.isArray(obj.wings)) {
    return { valid: false, error: 'option.wings must be an array' }
  }

  for (const wing of obj.wings) {
    if (typeof wing !== 'object' || wing === null) {
      return { valid: false, error: 'Each wing must be an object' }
    }
    const w = wing as Record<string, unknown>
    if (typeof w.id !== 'string') return { valid: false, error: 'wing.id must be a string' }
    if (typeof w.length !== 'number' || w.length <= 0) return { valid: false, error: 'wing.length must be a positive number' }
    if (typeof w.width !== 'number' || w.width <= 0) return { valid: false, error: 'wing.width must be a positive number' }
    if (typeof w.floors !== 'number' || w.floors < 1) return { valid: false, error: 'wing.floors must be >= 1' }
    if (w.direction !== 'EW' && w.direction !== 'NS') return { valid: false, error: 'wing.direction must be "EW" or "NS"' }
  }

  // Metrics validation
  if (typeof obj.metrics !== 'object' || obj.metrics === null) {
    return { valid: false, error: 'option.metrics is required' }
  }
  const metrics = obj.metrics as Record<string, unknown>
  if (typeof metrics.footprint !== 'number' || metrics.footprint <= 0) {
    return { valid: false, error: 'option.metrics.footprint must be a positive number' }
  }

  return { valid: true, option: obj as unknown as DesignOption }
}

/* ------------------------------------------------------------------ */
/*  POST handler                                                      */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  if (isRateLimited(ip)) {
    return Response.json(
      { error: 'Too many requests. Please wait a moment.', code: 'RATE_LIMITED', status: 429 },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  // Parse body
  let body: { option?: unknown; format?: unknown }
  try {
    const text = await req.text()
    if (text.length > MAX_BODY_LENGTH) {
      return Response.json(
        { error: 'Request body too large', code: 'BODY_TOO_LARGE', status: 413 },
        { status: 413 },
      )
    }
    body = JSON.parse(text)
  } catch {
    return Response.json(
      { error: 'Invalid JSON body', code: 'INVALID_JSON', status: 400 },
      { status: 400 },
    )
  }

  // Validate option
  const validation = validateOptionShape(body.option)
  if (!validation.valid) {
    return Response.json(
      { error: validation.error, code: 'VALIDATION_ERROR', status: 400 },
      { status: 400 },
    )
  }

  const { option } = validation

  // Validate format param
  const format = typeof body.format === 'string'
    ? sanitiseString(body.format, 20)
    : 'generic'

  if (format !== 'generic' && format !== 'ladybug') {
    return Response.json(
      { error: 'format must be "generic" or "ladybug"', code: 'INVALID_FORMAT', status: 400 },
      { status: 400 },
    )
  }

  // Generate payload
  try {
    const payload = generateSimulationPayload(option)

    if (format === 'ladybug') {
      const scenario = mapToLadybugScenario(payload)
      return Response.json({ data: scenario, error: null })
    }

    return Response.json({ data: payload, error: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error generating simulation payload'
    return Response.json(
      { error: message, code: 'GENERATION_ERROR', status: 500 },
      { status: 500 },
    )
  }
}
