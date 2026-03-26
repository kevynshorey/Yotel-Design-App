'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { getSelectedOption } from '@/store/design-store'
import { useUser } from '@/lib/use-user'
import { ProjectSwitcher } from '@/components/project/project-switcher'
import type { DesignOption } from '@/engine/types'

export function CommandBar() {
  const [option, setOption] = useState<DesignOption | null>(null)
  const [mounted, setMounted] = useState(false)
  const user = useUser()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    setOption(getSelectedOption())

    const handler = () => setOption(getSelectedOption())
    window.addEventListener('design-option-changed', handler)
    return () => window.removeEventListener('design-option-changed', handler)
  }, [])

  // Use stable defaults during SSR to avoid hydration mismatch
  const keysLabel = mounted && option ? `${option.metrics.totalKeys} keys` : '130 keys'
  const tdcLabel = mounted && option
    ? `$${(option.cost.total / 1_000_000).toFixed(1)}M TDC`
    : '$55M TDC est.'

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    window.dispatchEvent(new Event('user-changed'))
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-10 items-center justify-between border-b border-[rgba(0,0,0,0.08)] bg-white/80 px-2 md:px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 min-w-0">
        <ProjectSwitcher />
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500 flex-shrink-0">
        {/* Project stats — hidden on small screens */}
        <span className="hidden sm:inline font-mono">{keysLabel}</span>
        <span className="hidden sm:inline">&middot;</span>
        <span className="hidden sm:inline font-mono">{tdcLabel}</span>

        {/* User info + logout */}
        {user && (
          <>
            <span className="hidden sm:inline">&middot;</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="font-medium text-slate-700">{user.name}</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none ${
                  user.role === 'admin'
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {user.role === 'admin' ? 'Admin' : 'Investor'}
              </span>
            </span>
            <button
              onClick={handleLogout}
              title="Logout"
              className="ml-1 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
