'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Box, FileCheck, BarChart3, FolderOpen, Users, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

const modules = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', shortcut: '0' },
  { href: '/design', icon: Box, label: 'Design', shortcut: '1' },
  { href: '/planning', icon: FileCheck, label: 'Planning', shortcut: '2' },
  { href: '/finance', icon: BarChart3, label: 'Finance', shortcut: '3' },
  { href: '/dataroom', icon: FolderOpen, label: 'Dataroom', shortcut: '4' },
  { href: '/invest', icon: Users, label: 'Investors', shortcut: '5' },
]

export function IconRail() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        // Mobile: horizontal bottom tab bar
        'fixed bottom-0 left-0 right-0 z-40 flex flex-row items-center justify-around bg-[--rail-bg] px-1 py-1.5',
        'border-t border-slate-700/50',
        // md+: vertical left rail (restore original)
        'md:static md:bottom-auto md:left-auto md:right-auto md:z-auto',
        'md:h-full md:w-14 md:flex-col md:justify-start md:gap-1 md:border-t-0 md:px-0 md:py-3',
      )}
    >
      {/* Logo — hidden on mobile, shown on md+ */}
      <div className="hidden md:mb-4 md:flex md:h-8 md:w-8 md:items-center md:justify-center md:rounded-md md:bg-sky-400/20 md:text-xs md:font-bold md:text-sky-400">
        YB
      </div>

      {modules.map((mod) => {
        const isActive = pathname.startsWith(mod.href)
        return (
          <div key={mod.href} className="group relative">
            <Link
              href={mod.href}
              className={cn(
                // Mobile: smaller tap targets, with label below
                'flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 transition-colors',
                // md+: icon-only square buttons
                'md:flex-row md:gap-0 md:px-0 md:py-0 md:h-10 md:w-10',
                isActive
                  ? 'bg-sky-400/20 text-sky-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
              )}
            >
              <mod.icon className="h-5 w-5" />
              {/* Label visible on mobile only */}
              <span className="text-[9px] leading-tight md:hidden">{mod.label}</span>
            </Link>
            {/* Tooltip — desktop only */}
            <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-nowrap z-50 hidden md:block">
              {mod.label}
            </div>
          </div>
        )
      })}

      {/* Spacer pushes AI button to bottom on desktop */}
      <div className="hidden md:mt-auto md:block" />

      {/* AI Assistant toggle */}
      <div className="group relative">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-ai-chat'))}
          className="flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 text-violet-400 transition-colors hover:bg-violet-500/10 hover:text-violet-300 md:h-10 md:w-10 md:flex-row md:gap-0 md:px-0 md:py-0"
        >
          <Brain className="h-5 w-5" />
          <span className="text-[9px] leading-tight md:hidden">AI</span>
        </button>
        <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-nowrap z-50 hidden md:block">
          AI Assistant
        </div>
      </div>
    </nav>
  )
}
