import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { YotelPDFDocument } from '@/components/report/pdf-document'
import type { DesignOption } from '@/engine/types'

/* ------------------------------------------------------------------ */
/*  Rate-limiter (in-memory, per-IP, sliding window — 5 req/min)      */
/* ------------------------------------------------------------------ */
const WINDOW_MS = 60_000
const MAX_REQUESTS = 5
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
/*  Input sanitisation                                                */
/* ------------------------------------------------------------------ */
function sanitiseString(val: unknown, maxLen = 200): string {
  if (typeof val !== 'string') return ''
  return val.replace(/<[^>]*>/g, '').replace(/\0/g, '').slice(0, maxLen)
}

function isValidOption(data: unknown): data is DesignOption {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  return (
    typeof d.id === 'string' &&
    typeof d.form === 'string' &&
    d.metrics != null &&
    d.cost != null &&
    d.revenue != null &&
    d.validation != null
  )
}

/* ------------------------------------------------------------------ */
/*  POST /api/report — generate branded PDF                           */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  try {
    const body = await req.json()

    // Validate
    if (!isValidOption(body)) {
      return NextResponse.json(
        { error: 'Invalid design option data.' },
        { status: 400 },
      )
    }

    // Sanitise string fields (id, form) to prevent injection
    const option: DesignOption = {
      ...body,
      id: sanitiseString(body.id, 100),
      form: body.form,
    }

    // Render PDF to buffer
    const element = React.createElement(YotelPDFDocument, {
      option,
      cost: option.cost,
      projection: option.revenue,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any)

    // Convert Node Buffer to Uint8Array for NextResponse compatibility
    const uint8 = new Uint8Array(buffer)

    // Return PDF
    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="YOTEL-Barbados-Feasibility-${option.id}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[api/report] PDF generation failed:', err)
    return NextResponse.json(
      { error: 'Failed to generate PDF report.' },
      { status: 500 },
    )
  }
}
