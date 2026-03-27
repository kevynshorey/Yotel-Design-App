'use client'

import { useState } from 'react'
import { IconRail } from '@/components/shell/icon-rail'
import { CommandBar } from '@/components/shell/command-bar'
import { KeyboardNav } from '@/components/shell/keyboard-nav'
import { ChatPanel } from '@/components/ai/chat-panel'
import { AuditPanelWrapper } from '@/components/audit/audit-panel-wrapper'
import { DesignProvider } from '@/context/design-context'
import { ProjectSelector } from '@/components/project-selector'
import type { ProjectId } from '@/engine/types'

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const [activeProject, setActiveProject] = useState<ProjectId>('carlisle-bay')

  return (
    <DesignProvider>
      <KeyboardNav />
      {/* Mobile: column layout with bottom tab bar; md+: row layout with left rail */}
      <div className="flex h-screen flex-col overflow-hidden md:flex-row">
        <IconRail />
        <div className="flex flex-1 flex-col overflow-hidden min-h-0">
          <CommandBar />
          <div className="border-b border-[rgba(0,0,0,0.06)] bg-white/60 px-3 py-1.5 backdrop-blur-sm">
            <ProjectSelector
              activeProject={activeProject}
              onProjectChange={setActiveProject}
            />
          </div>
          {/* pb-14 on mobile to clear the fixed bottom tab bar */}
          <main className="relative flex-1 overflow-hidden pb-14 md:pb-0">{children}</main>
        </div>
      </div>
      <ChatPanel />
      <AuditPanelWrapper />
    </DesignProvider>
  )
}
