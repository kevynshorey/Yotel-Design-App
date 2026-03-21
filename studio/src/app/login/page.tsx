'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/design')
      router.refresh()
    } else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <form onSubmit={handleSubmit} className="w-80 space-y-4">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-sky-400/20 text-sm font-bold text-sky-400">
            YB
          </div>
          <h1 className="text-lg font-semibold text-white">YOTEL Development Studio</h1>
          <p className="mt-1 text-xs text-slate-400">Enter access code to continue</p>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false) }}
          placeholder="Access code"
          autoFocus
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
        />
        {error && <p className="text-xs text-red-400">Invalid access code</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-sky-500 py-2.5 text-sm font-medium text-white hover:bg-sky-400 transition-colors"
        >
          Enter
        </button>
        <p className="text-center text-[10px] text-slate-600">
          Coruscant Developments Ltd · Confidential
        </p>
      </form>
    </div>
  )
}
