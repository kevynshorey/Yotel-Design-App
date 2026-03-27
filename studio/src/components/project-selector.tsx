'use client'

import { PROJECTS } from '@/config/projects'
import type { ProjectId } from '@/engine/types'

interface ProjectSelectorProps {
  activeProject: ProjectId
  onProjectChange: (id: ProjectId) => void
}

export function ProjectSelector({ activeProject, onProjectChange }: ProjectSelectorProps) {
  const projectIds = Object.keys(PROJECTS) as ProjectId[]

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
      {projectIds.map((id) => {
        const project = PROJECTS[id]
        const isActive = id === activeProject
        return (
          <button
            key={id}
            onClick={() => onProjectChange(id)}
            className={`rounded-md px-3 py-1.5 text-left transition-colors ${
              isActive
                ? 'bg-white shadow-sm ring-1 ring-slate-200'
                : 'hover:bg-white/60'
            }`}
          >
            <p
              className={`text-xs font-semibold leading-tight ${
                isActive ? 'text-sky-700' : 'text-slate-600'
              }`}
            >
              {project.name}
            </p>
            <p className="mt-0.5 text-[10px] leading-tight text-slate-400">
              {project.description}
            </p>
          </button>
        )
      })}
    </div>
  )
}
