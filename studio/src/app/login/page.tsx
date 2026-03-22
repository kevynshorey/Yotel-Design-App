'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, ArrowRight, Shield, Building2, MapPin, Palmtree, Waves, CheckCircle2 } from 'lucide-react'
import type { AppUser } from '@/lib/auth'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<AppUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      const data = await res.json()
      setLoggedInUser(data.user as AppUser)
      // Dispatch event so other components can pick up the user
      window.dispatchEvent(new Event('user-changed'))
      // Brief delay to show welcome message
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1200)
    } else {
      setError(true)
      setPassword('')
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 lg:flex-row">
      {/* ── Animated backdrop blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 h-[700px] w-[700px] animate-pulse rounded-full bg-sky-500/[0.04] blur-3xl" />
        <div
          className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full bg-teal-500/[0.04] blur-3xl"
          style={{ animation: 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite' }}
        />
        <div
          className="absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-sky-400/[0.03] blur-3xl"
          style={{ animation: 'pulse 6s cubic-bezier(0.4,0,0.6,1) infinite' }}
        />
      </div>

      {/* ── LEFT SIDE: Hero / Branding panel ── */}
      <div className="relative flex w-full flex-col justify-between overflow-hidden lg:w-1/2 lg:min-h-screen">
        {/* Gradient overlay on the hero area */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/95 to-sky-950/90" />

        {/* Animated gradient shimmer */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'linear-gradient(135deg, transparent 0%, rgba(56,189,248,0.05) 25%, transparent 50%, rgba(20,184,166,0.04) 75%, transparent 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 12s ease infinite',
          }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Hero content */}
        <div className="relative flex flex-1 flex-col justify-between p-8 sm:p-10 lg:p-12">
          {/* Top: Logo & brand */}
          <div
            className={`transition-all duration-700 ${
              mounted ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-400/20 font-mono text-sm font-bold text-sky-400">
                YB
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-white">YOTEL BARBADOS</p>
                <p className="text-[10px] tracking-[0.2em] text-slate-500">DEVELOPMENT STUDIO</p>
              </div>
            </div>
          </div>

          {/* Centre: Project hero */}
          <div
            className={`space-y-6 py-8 transition-all duration-1000 delay-200 lg:py-0 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-400">
                Dual-Brand Hotel &amp; Residences
              </p>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Carlisle Bay
                <br />
                <span className="text-sky-400">Bridgetown</span>
              </h1>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              130-key mixed-use development combining YOTEL&apos;s tech-forward hospitality
              with YOTELPAD branded residences on Barbados&apos; premier beachfront.
            </p>

            {/* Project stats */}
            <div className="grid grid-cols-3 gap-3 pt-2 sm:gap-4">
              {[
                { value: '130', label: 'Total Keys' },
                { value: '5,965', label: 'Site m\u00B2' },
                { value: '$47M', label: 'TDC' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-3 backdrop-blur-sm"
                >
                  <p className="font-mono text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Feature highlights — hidden on mobile for compactness */}
            <div className="hidden space-y-2.5 pt-2 sm:block">
              {[
                { icon: Building2, text: '100 YOTEL rooms + 30 YOTELPAD residences' },
                { icon: MapPin, text: 'Carlisle Bay beachfront, Bridgetown' },
                { icon: Palmtree, text: 'Pool deck, rooftop bar, infinity edge pool' },
                { icon: Waves, text: 'Caribbean beachfront with direct ocean access' },
                { icon: Shield, text: 'Category 4+ hurricane resilient design' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-sky-400/60" />
                  <span className="text-xs text-slate-400">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Company credit */}
          <div
            className={`hidden transition-all duration-700 delay-500 lg:block ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-slate-500">Coruscant Developments Ltd</p>
              <p className="text-[10px] text-slate-600">Barbados &middot; Development Sponsor</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE: Login form panel ── */}
      <div className="relative flex w-full items-center justify-center p-6 sm:p-8 lg:w-1/2 lg:min-h-screen">
        {/* Panel background accent */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/50 lg:bg-gradient-to-br lg:from-slate-950/80 lg:via-slate-950 lg:to-slate-900/30" />

        <div
          className={`relative w-full max-w-sm transition-all duration-700 delay-300 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {/* Form card */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
            {loggedInUser ? (
              /* ── Welcome message after successful login ── */
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-white">
                    Welcome back, {loggedInUser.name}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {loggedInUser.role === 'admin' ? 'Full access' : 'View-only access'}
                  </p>
                </div>
                <div className="h-1 w-24 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full animate-pulse rounded-full bg-sky-400" style={{ width: '100%' }} />
                </div>
                <p className="text-[10px] text-slate-500">Entering studio...</p>
              </div>
            ) : (
              /* ── Login form ── */
              <>
                <div className="mb-6 text-center lg:text-left">
                  <h2 className="text-lg font-semibold text-white">Access Studio</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Enter your access code to view the development platform
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError(false)
                      }}
                      placeholder="Access code"
                      autoFocus
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-700/60 bg-slate-800/60 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400/50 focus:bg-slate-800/80 disabled:opacity-50"
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
                      <p className="text-xs text-red-400">Invalid access code. Please try again.</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !password}
                    className="group flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 py-3 text-sm font-medium text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 hover:shadow-sky-400/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    {loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        Enter Studio
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 flex items-center gap-2 border-t border-slate-800/60 pt-4">
              <Shield className="h-3 w-3 text-slate-600" />
              <p className="text-[10px] text-slate-600">
                Confidential &middot; Authorized personnel only
              </p>
            </div>
          </div>

          {/* Footer credit */}
          <p className="mt-6 text-center text-[10px] text-slate-600">
            Coruscant Developments Ltd &middot; Barbados
          </p>
        </div>
      </div>

      {/* ── Keyframe animation for gradient shimmer ── */}
      <style jsx global>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  )
}
