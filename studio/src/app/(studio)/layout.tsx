import { IconRail } from '@/components/shell/icon-rail'
import { CommandBar } from '@/components/shell/command-bar'
import { KeyboardNav } from '@/components/shell/keyboard-nav'
import { DesignProvider } from '@/context/design-context'

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <DesignProvider>
      <KeyboardNav />
      <div className="flex h-screen overflow-hidden">
        <IconRail />
        <div className="flex flex-1 flex-col overflow-hidden">
          <CommandBar />
          <main className="relative flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </DesignProvider>
  )
}
