'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown, Plus, Trash2, FolderOpen, LayoutGrid } from 'lucide-react'
import {
  getProjects,
  getActiveProject,
  setActiveProject,
  deleteProject,
} from '@/store/project-store'
import type { Project } from '@/store/project-store'
import { ProjectWizard } from './project-wizard'

export function ProjectSwitcher() {
  const [open, setOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [active, setActive] = useState<Project | null>(null)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  function refresh() {
    setProjects(getProjects())
    setActive(getActiveProject())
  }

  useEffect(() => {
    setMounted(true)
    refresh()

    const onProjectsChanged = () => refresh()
    const onActiveChanged = () => refresh()

    window.addEventListener('projects-changed', onProjectsChanged)
    window.addEventListener('active-project-changed', onActiveChanged)
    return () => {
      window.removeEventListener('projects-changed', onProjectsChanged)
      window.removeEventListener('active-project-changed', onActiveChanged)
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleSwitch(id: string) {
    setActiveProject(id)
    setOpen(false)
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (projects.length <= 1) return
    deleteProject(id)
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-slate-900 truncate">Loading...</span>
      </div>
    )
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Trigger */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors hover:bg-slate-100"
        >
          <FolderOpen className="h-3.5 w-3.5 text-sky-500" />
          <span className="text-sm font-semibold text-slate-900 truncate max-w-[180px]">
            {active?.name ?? 'No Project'}
          </span>
          <span className="hidden md:inline text-xs text-slate-500 truncate max-w-[200px]">
            {active?.location ?? ''}
          </span>
          <ChevronDown className="h-3 w-3 text-slate-400 flex-shrink-0" />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Projects
              </p>
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSwitch(p.id)}
                  className={`group flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-slate-50 ${
                    p.id === active?.id ? 'bg-sky-50' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-medium ${
                        p.id === active?.id ? 'text-sky-700' : 'text-slate-700'
                      }`}
                    >
                      {p.name}
                    </p>
                    <p className="truncate text-xs text-slate-400">{p.location}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                      {p.totalKeys} keys
                    </span>
                    {projects.length > 1 && (
                      <button
                        onClick={(e) => handleDelete(e, p.id)}
                        className="rounded p-1 text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                        title="Delete project"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t border-slate-100 p-1.5 space-y-0.5">
              <Link
                href="/select-project"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                All Projects
              </Link>
              <button
                onClick={() => {
                  setOpen(false)
                  setWizardOpen(true)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sky-600 transition-colors hover:bg-sky-50"
              >
                <Plus className="h-3.5 w-3.5" />
                New Project
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wizard modal */}
      {wizardOpen && (
        <ProjectWizard
          onClose={() => setWizardOpen(false)}
          onCreated={() => refresh()}
        />
      )}
    </>
  )
}
