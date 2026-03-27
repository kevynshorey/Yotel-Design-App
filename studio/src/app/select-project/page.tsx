'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Building2, ArrowRight, FolderOpen } from 'lucide-react'
import { getProjects, setActiveProject } from '@/store/project-store'
import type { Project } from '@/store/project-store'

export default function SelectProjectPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    setProjects(getProjects())
  }, [])

  function handleSelect(id: string) {
    setActiveProject(id)
    router.push('/dashboard')
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12">
      {/* Backdrop blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 h-[600px] w-[600px] animate-pulse rounded-full bg-sky-500/[0.04] blur-3xl" />
        <div className="absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full bg-teal-500/[0.04] blur-3xl" style={{ animation: 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite' }} />
      </div>

      <div
        className={`relative w-full max-w-2xl transition-all duration-700 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-400/20 font-mono text-sm font-bold text-sky-400">
              CD
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold tracking-wide text-white">CORUSCANT DEVELOPMENTS</p>
              <p className="text-[10px] tracking-[0.2em] text-slate-500">DEVELOPMENT STUDIO</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Select a Project</h1>
          <p className="mt-1 text-sm text-slate-400">Choose the development project to view</p>
        </div>

        {/* Project cards */}
        <div className="space-y-3">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleSelect(project.id)}
              className="group flex w-full items-center gap-4 rounded-xl border border-slate-800/60 bg-slate-900/60 p-5 text-left transition-all hover:border-sky-500/40 hover:bg-slate-900/90 backdrop-blur-sm"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
                <FolderOpen className="h-5 w-5 text-sky-400" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                  {project.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-400">{project.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {project.location}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Building2 className="h-3 w-3" />
                    {project.totalKeys} keys
                  </span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                    {project.brandConfig.primary}
                    {project.brandConfig.secondary ? ` · ${project.brandConfig.secondary}` : ''}
                  </span>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-400" />
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-[10px] text-slate-600">
          Coruscant Developments Ltd &middot; Barbados
        </p>
      </div>
    </div>
  )
}
