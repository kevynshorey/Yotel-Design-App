import { IconRail } from '@/components/shell/icon-rail'
import { CommandBar } from '@/components/shell/command-bar'

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <IconRail />
      <div className="flex flex-1 flex-col overflow-hidden">
        <CommandBar />
        <main className="relative flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
