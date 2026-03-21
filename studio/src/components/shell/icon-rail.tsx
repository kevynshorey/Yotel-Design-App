'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Box, FileCheck, BarChart3, FolderOpen, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

const modules = [
  { href: '/design', icon: Box, label: 'Design', shortcut: '1' },
  { href: '/planning', icon: FileCheck, label: 'Planning', shortcut: '2' },
  { href: '/finance', icon: BarChart3, label: 'Finance', shortcut: '3' },
  { href: '/dataroom', icon: FolderOpen, label: 'Dataroom', shortcut: '4' },
  { href: '/invest', icon: Users, label: 'Investors', shortcut: '5' },
]

export function IconRail() {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={300}>
      <nav className="flex h-full w-14 flex-col items-center gap-1 bg-[--rail-bg] py-3">
        {/* Logo */}
        <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-md bg-sky-400/20 text-xs font-bold text-sky-400">
          YB
        </div>

        {modules.map((mod) => {
          const isActive = pathname.startsWith(mod.href)
          return (
            <Tooltip key={mod.href}>
              <TooltipTrigger asChild>
                <Link
                  href={mod.href}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                    isActive
                      ? 'bg-sky-400/20 text-sky-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                  )}
                >
                  <mod.icon className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {mod.label} <kbd className="ml-1 text-[10px] text-muted-foreground">{mod.shortcut}</kbd>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}
