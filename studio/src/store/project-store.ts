'use client'

import type { Point2D } from '@/engine/types'

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface SiteConfig {
  boundary: Point2D[]
  buildableArea: Point2D[]
  offsets: { W: number; N: number; E: number; S: number }
  grossArea: number
  buildableAreaSqm: number
  maxCoverage: number
  maxHeight: number
}

export interface BrandConfig {
  primary: string       // e.g. "YOTEL"
  secondary?: string    // e.g. "YOTELPAD"
  primaryKeys: number
  secondaryKeys: number
}

export interface PlanningRulesConfig {
  jurisdiction: string  // e.g. "Barbados" or "Custom"
  coastalSetback: number
  maxCoverage: number
  maxHeight: number
  maxStoreys: number
  sideSetback: number
  rearSetback: number
  roadSetback: number
  eiaRequired: boolean
  heritageZone: boolean
}

export interface Project {
  id: string
  name: string
  location: string
  description: string
  totalKeys: number
  brandConfig: BrandConfig
  siteConfig: SiteConfig
  planningRules: PlanningRulesConfig
  createdAt: string   // ISO date
  updatedAt: string   // ISO date
}

// ── Constants ───────────────────────────────────────────────────────────────

const PROJECTS_KEY = 'yotel-projects'
const ACTIVE_KEY = 'yotel-active-project'

// ── Default YOTEL Barbados project (seeded from current config/site.ts) ─────

const DEFAULT_PROJECT_ID = 'yotel-barbados-carlisle-bay'

function createDefaultProject(): Project {
  return {
    id: DEFAULT_PROJECT_ID,
    name: 'YOTEL Barbados',
    location: 'Carlisle Bay, Bridgetown',
    description: '130-key dual-brand hotel & residences on Barbados\u2019 west coast',
    totalKeys: 130,
    brandConfig: {
      primary: 'YOTEL',
      secondary: 'YOTELPAD',
      primaryKeys: 100,
      secondaryKeys: 30,
    },
    siteConfig: {
      boundary: [
        { x: 1.009, y: -0.301 },
        { x: -10.767, y: 26.325 },
        { x: 9.350, y: 34.945 },
        { x: 41.455, y: 54.551 },
        { x: 70.225, y: 57.869 },
        { x: 99.271, y: 64.064 },
        { x: 116.286, y: 65.293 },
        { x: 120.661, y: 7.772 },
        { x: 71.756, y: 5.659 },
        { x: 23.308, y: 3.414 },
      ],
      buildableArea: [
        { x: 66.161, y: 8.403 },
        { x: 35.597, y: 8.403 },
        { x: 35.597, y: 46.533 },
        { x: 42.789, y: 50.678 },
        { x: 70.873, y: 53.917 },
        { x: 85.741, y: 57.088 },
        { x: 113.901, y: 57.088 },
        { x: 115.434, y: 36.933 },
        { x: 115.434, y: 10.549 },
        { x: 71.622, y: 8.656 },
      ],
      offsets: { W: 55, N: 8, E: 5, S: 5 },
      grossArea: 5965,
      buildableAreaSqm: 3599.1,
      maxCoverage: 0.50,
      maxHeight: 22.0,
    },
    planningRules: {
      jurisdiction: 'Barbados',
      coastalSetback: 30,
      maxCoverage: 0.50,
      maxHeight: 22.0,
      maxStoreys: 6,
      sideSetback: 1.83,
      rearSetback: 1.83,
      roadSetback: 5.79,
      eiaRequired: true,
      heritageZone: true,
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  }
}

// ── Storage helpers ─────────────────────────────────────────────────────────

function readProjects(): Project[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Project[]
  } catch {
    return []
  }
}

function writeProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
  window.dispatchEvent(new CustomEvent('projects-changed'))
}

function ensureSeeded(): Project[] {
  let projects = readProjects()
  if (projects.length === 0) {
    projects = [createDefaultProject()]
    writeProjects(projects)
  }
  return projects
}

// ── Public API ──────────────────────────────────────────────────────────────

export function getProjects(): Project[] {
  return ensureSeeded()
}

export function getActiveProjectId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACTIVE_KEY)
}

export function getActiveProject(): Project | null {
  const projects = ensureSeeded()
  const activeId = getActiveProjectId()

  // Return active if found
  if (activeId) {
    const found = projects.find((p) => p.id === activeId)
    if (found) return found
  }

  // Fall back to first project
  if (projects.length > 0) {
    localStorage.setItem(ACTIVE_KEY, projects[0].id)
    return projects[0]
  }

  return null
}

export function setActiveProject(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACTIVE_KEY, id)
  window.dispatchEvent(new CustomEvent('active-project-changed'))
}

export function createProject(
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Project {
  const now = new Date().toISOString()
  const id = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36)

  const project: Project = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  }

  const projects = ensureSeeded()
  projects.push(project)
  writeProjects(projects)

  return project
}

export function updateProject(
  id: string,
  updates: Partial<Omit<Project, 'id' | 'createdAt'>>
): Project | null {
  const projects = ensureSeeded()
  const idx = projects.findIndex((p) => p.id === id)
  if (idx === -1) return null

  projects[idx] = {
    ...projects[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  writeProjects(projects)
  return projects[idx]
}

export function deleteProject(id: string): boolean {
  const projects = ensureSeeded()
  const filtered = projects.filter((p) => p.id !== id)
  if (filtered.length === projects.length) return false

  writeProjects(filtered)

  // If we deleted the active project, switch to first available
  if (getActiveProjectId() === id) {
    if (filtered.length > 0) {
      setActiveProject(filtered[0].id)
    } else {
      localStorage.removeItem(ACTIVE_KEY)
      window.dispatchEvent(new CustomEvent('active-project-changed'))
    }
  }

  return true
}
