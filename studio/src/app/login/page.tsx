'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, MapPin, KeyRound, ArrowRight, Shield, Palmtree } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
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
      router.push('/dashboard')
      router.refresh()
    } else {
      setError(true)
      setPassword('')
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950">
      {/* Background gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950" />
      <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-sky-500/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-teal-500/5 blur-3xl" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Left panel — branding & project info */}
      <div className="relative hidden w-1/2 flex-col justify-between p-12 lg:flex">
        {/* Top — logo & brand */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-400/20 font-mono text-sm font-bold text-sky-400">
              YB
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">YOTEL BARBADOS</p>
              <p className="text-[10px] tracking-widest text-slate-500">DEVELOPMENT STUDIO</p>
            </div>
          </div>
        </div>

        {/* Centre — project hero */}
        <div className={`space-y-6 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-400">Dual-Brand Hotel & Residences</p>
            <h1 className="text-4xl font-bold leading-tight text-white">
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
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-3">
              <p className="font-mono text-lg font-bold text-white">130</p>
              <p className="text-[10px] text-slate-500">Total Keys</p>
            </div>
            <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-3">
              <p className="font-mono text-lg font-bold text-white">5,965</p>
              <p className="text-[10px] text-slate-500">Site m²</p>
            </div>
            <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-3">
              <p className="font-mono text-lg font-bold text-white">$47M</p>
              <p className="text-[10px] text-slate-500">TDC</p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="space-y-2.5 pt-2">
            {[
              { icon: Building2, text: '100 YOTEL rooms + 30 YOTELPAD residences' },
              { icon: MapPin, text: 'Carlisle Bay beachfront, Bridgetown' },
              { icon: Palmtree, text: 'Pool deck, rooftop bar, infinity edge pool' },
              { icon: Shield, text: 'Category 4+ hurricane resilient design' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <Icon className="h-3.5 w-3.5 shrink-0 text-sky-400/60" />
                <span className="text-xs text-slate-400">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — company credit */}
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-slate-500">Coruscant Developments Ltd</p>
          <p className="text-[10px] text-slate-600">Barbados · Development Sponsor</p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="relative flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className={`w-full max-w-sm transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {/* Mobile logo (hidden on desktop) */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-sky-400/20 font-mono text-sm font-bold text-sky-400">
              YB
            </div>
            <h1 className="text-lg font-semibold text-white">YOTEL Development Studio</h1>
            <p className="mt-1 text-xs text-slate-400">Carlisle Bay · Bridgetown · Barbados</p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-8 backdrop-blur-xl">
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
                  onChange={(e) => { setPassword(e.target.value); setError(false) }}
                  placeholder="Access code"
                  autoFocus
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-700/60 bg-slate-800/60 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 px-3 py-2">
                  <p className="text-xs text-red-400">Invalid access code. Please try again.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 py-3 text-sm font-medium text-white transition-all hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
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

            <div className="mt-6 flex items-center gap-2 border-t border-slate-800/60 pt-4">
              <Shield className="h-3 w-3 text-slate-600" />
              <p className="text-[10px] text-slate-600">
                Confidential · Authorized personnel only
              </p>
            </div>
          </div>

          {/* Mobile company credit */}
          <p className="mt-6 text-center text-[10px] text-slate-600 lg:hidden">
            Coruscant Developments Ltd · Barbados
          </p>
        </div>
      </div>
    </div>
  )
}
