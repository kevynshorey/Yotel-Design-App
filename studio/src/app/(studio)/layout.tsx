import { IconRail } from '@/components/shell/icon-rail'
import { CommandBar } from '@/components/shell/command-bar'
import { KeyboardNav } from '@/components/shell/keyboard-nav'
import { DesignProvider } from '@/context/design-context'

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <DesignProvider>
      <KeyboardNav />
      {/* Mobile: column layout with bottom tab bar; md+: row layout with left rail */}
      <div className="flex h-screen flex-col overflow-hidden md:flex-row">
        <IconRail />
        <div className="flex flex-1 flex-col overflow-hidden min-h-0">
          <CommandBar />
          {/* pb-14 on mobile to clear the fixed bottom tab bar */}
          <main className="relative flex-1 overflow-hidden pb-14 md:pb-0">{children}</main>
        </div>
      </div>
    </DesignProvider>
  )
}
