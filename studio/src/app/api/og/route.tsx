import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          padding: '60px',
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            width: '120px',
            height: '4px',
            backgroundColor: '#0ea5e9',
            marginBottom: '40px',
            display: 'flex',
          }}
        />

        {/* Main title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.1,
            display: 'flex',
          }}
        >
          YOTEL Development Studio
        </div>

        {/* Location subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: '#0ea5e9',
            marginTop: '24px',
            letterSpacing: '0.1em',
            display: 'flex',
          }}
        >
          Carlisle Bay &middot; Bridgetown &middot; Barbados
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '22px',
            color: '#94a3b8',
            marginTop: '20px',
            display: 'flex',
          }}
        >
          Enterprise Architecture &amp; Design Platform
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            width: '120px',
            height: '4px',
            backgroundColor: '#0ea5e9',
            marginTop: '40px',
            display: 'flex',
          }}
        />

        {/* Company name */}
        <div
          style={{
            fontSize: '16px',
            color: '#64748b',
            marginTop: '32px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            display: 'flex',
          }}
        >
          Coruscant Developments Ltd
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
