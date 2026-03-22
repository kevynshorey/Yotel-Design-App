// ── Barbados Planning Approval Tracker ─────────────────────────────────
// Tracks all 5 regulatory approval tracks for the YOTEL Barbados project.

export type ApprovalStatus = 'NOT_DONE' | 'IN_PROGRESS' | 'PENDING' | 'CONFIRMED' | 'COMPLETE'

export interface ApprovalStep {
  id: string
  requirement: string
  status: ApprovalStatus
  source?: string
  notes?: string
  responsible?: string
  blocks?: string
}

export interface ApprovalTrack {
  id: string
  name: string
  authority: string
  timeline: string
  steps: ApprovalStep[]
}

// ── Track A: Planning Permission (PDB) ────────────────────────────────
const PLANNING_PERMISSION: ApprovalTrack = {
  id: 'A',
  name: 'Planning Permission',
  authority: 'Planning & Development Board (PDB)',
  timeline: '6-12 months from submission',
  steps: [
    { id: 'A1', requirement: 'Pre-application consultation with Chief Town Planner', status: 'NOT_DONE', responsible: 'Architect / Planning Consultant', notes: 'Recommended before formal submission to identify issues early' },
    { id: 'A2', requirement: 'Road class confirmation (Highway Authority)', status: 'NOT_DONE', responsible: 'Transport Consultant', blocks: 'A7' },
    { id: 'A3', requirement: 'Coastal survey (CZMU baseline)', status: 'NOT_DONE', responsible: 'Coastal Engineer', notes: 'Required for all sites within 100m of HWM' },
    { id: 'A4', requirement: 'SDA boundary confirmation', status: 'NOT_DONE', responsible: 'Planning Consultant', notes: 'Confirm site falls within Special Development Area', blocks: 'C2' },
    { id: 'A5', requirement: 'Geotechnical survey', status: 'NOT_DONE', responsible: 'Geotech Engineer', notes: 'Soil bearing capacity, water table, coral rock depth' },
    { id: 'A6', requirement: 'Registered professional engaged (architect/engineer)', status: 'NOT_DONE', responsible: 'Developer', blocks: 'A8' },
    { id: 'A7', requirement: 'Application form (Form 1)', status: 'NOT_DONE', responsible: 'Planning Consultant', blocks: 'A12' },
    { id: 'A8', requirement: 'Site plan (1:500 scale, boundaries, setbacks, access)', status: 'NOT_DONE', responsible: 'Architect', blocks: 'A7' },
    { id: 'A9', requirement: 'Building plans (floor plans, elevations, sections)', status: 'NOT_DONE', responsible: 'Architect', blocks: 'A7' },
    { id: 'A10', requirement: 'Design certificate (registered professional)', status: 'NOT_DONE', responsible: 'Architect', blocks: 'A7' },
    { id: 'A11', requirement: 'Environmental Impact Statement (EIS)', status: 'NOT_DONE', responsible: 'Environmental Consultant', notes: 'Mandatory for >50 rooms + coastal site. See Track E.', blocks: 'A7' },
    { id: 'A12', requirement: 'Application fee payment', status: 'NOT_DONE', responsible: 'Developer', blocks: 'A13' },
    { id: 'A13', requirement: 'Referral — Chief Town Planner (CTP)', status: 'NOT_DONE', responsible: 'PDB Secretariat', notes: 'Automatic referral on submission' },
    { id: 'A14', requirement: 'Referral — Electrical Engineer (BL&P)', status: 'NOT_DONE', responsible: 'PDB Secretariat' },
    { id: 'A15', requirement: 'Referral — Public Health Inspector', status: 'NOT_DONE', responsible: 'PDB Secretariat' },
    { id: 'A16', requirement: 'Referral — Fire Officer', status: 'NOT_DONE', responsible: 'PDB Secretariat' },
    { id: 'A17', requirement: 'Public consultation / neighbour notification', status: 'NOT_DONE', responsible: 'PDB Secretariat', notes: 'Neighbours within 30m notified; 21-day objection window' },
    { id: 'A18', requirement: 'Board decision (approve / approve with conditions / refuse)', status: 'NOT_DONE', responsible: 'PDB Board', blocks: 'B1' },
    { id: 'A19', requirement: 'Conditions discharged / accepted', status: 'NOT_DONE', responsible: 'Developer / Architect', notes: 'All conditions must be satisfied or waived before construction' },
  ],
}

// ── Track B: Building Permit (CTP) ────────────────────────────────────
const BUILDING_PERMIT: ApprovalTrack = {
  id: 'B',
  name: 'Building Permit',
  authority: 'Chief Town Planner (CTP)',
  timeline: '2-4 months after planning permission',
  steps: [
    { id: 'B1', requirement: 'Building code compliant plans submitted', status: 'NOT_DONE', responsible: 'Architect', notes: 'Barbados National Building Code + CUBiC reference' },
    { id: 'B2', requirement: 'Structural engineer certification', status: 'NOT_DONE', responsible: 'Structural Engineer', notes: 'Hurricane Cat 3+ wind loads, seismic zone 2' },
    { id: 'B3', requirement: 'MEP engineer certification', status: 'NOT_DONE', responsible: 'MEP Engineer' },
    { id: 'B4', requirement: 'Fire safety design statement', status: 'NOT_DONE', responsible: 'Fire Consultant' },
    { id: 'B5', requirement: 'Fire Officer certification', status: 'NOT_DONE', responsible: 'Fire Officer', blocks: 'B6' },
    { id: 'B6', requirement: 'Building permit issued', status: 'NOT_DONE', responsible: 'CTP', notes: 'Authorises commencement of construction' },
    { id: 'B7', requirement: 'Staged inspections (foundation, frame, envelope, MEP)', status: 'NOT_DONE', responsible: 'CTP / Building Inspector', notes: 'Multiple inspections during construction' },
    { id: 'B8', requirement: 'Compliance certificate', status: 'NOT_DONE', responsible: 'CTP', blocks: 'B9' },
    { id: 'B9', requirement: 'Certificate of Occupancy', status: 'NOT_DONE', responsible: 'CTP', notes: 'Required before hotel can open to guests' },
  ],
}

// ── Track C: SDA Developer Status (CAP 237A) ──────────────────────────
const SDA_STATUS: ApprovalTrack = {
  id: 'C',
  name: 'SDA Developer Status',
  authority: 'Ministry of Finance (CAP 237A Special Development Areas Act)',
  timeline: '3-6 months',
  steps: [
    { id: 'C1', requirement: 'SDA developer status application submitted', status: 'NOT_DONE', responsible: 'Developer / Attorney', notes: 'Apply to Ministry of Finance under CAP 237A' },
    { id: 'C2', requirement: 'SDA boundary confirmation (site within designated area)', status: 'NOT_DONE', responsible: 'Planning Consultant', notes: 'Must confirm parcel falls within gazetted SDA boundary' },
    { id: 'C3', requirement: 'SDA developer status granted', status: 'NOT_DONE', responsible: 'Ministry of Finance', notes: 'DO NOT include SDA savings in financial model until this step is CONFIRMED' },
    { id: 'C4', requirement: 'SDA allowances claimed (duty-free imports, tax holidays)', status: 'NOT_DONE', responsible: 'Developer / Accountant', notes: 'Duty-free imports of construction materials, income tax holiday, land tax exemption' },
  ],
}

// ── Track D: Tourism Project Designation (Cap 341) ────────────────────
const TOURISM_DESIGNATION: ApprovalTrack = {
  id: 'D',
  name: 'Tourism Project Designation',
  authority: 'Ministry of Tourism (Cap 341 Tourism Development Act)',
  timeline: '4-8 months',
  steps: [
    { id: 'D1', requirement: 'TDA application submitted', status: 'NOT_DONE', responsible: 'Developer / Attorney', notes: 'Tourism Development Act application to Ministry of Tourism' },
    { id: 'D2', requirement: 'Interim approval (in-principle)', status: 'NOT_DONE', responsible: 'Ministry of Tourism', notes: 'Allows early procurement of duty-free materials' },
    { id: 'D3', requirement: 'Final approval', status: 'NOT_DONE', responsible: 'Ministry of Tourism', blocks: 'D4' },
    { id: 'D4', requirement: 'Licence to operate (tourism establishment)', status: 'NOT_DONE', responsible: 'Ministry of Tourism', notes: 'Required before hotel opens' },
    { id: 'D5', requirement: 'Import permit (duty-free construction materials)', status: 'NOT_DONE', responsible: 'Customs / Developer' },
    { id: 'D6', requirement: 'CTP sign-off (building compliance)', status: 'NOT_DONE', responsible: 'CTP' },
    { id: 'D7', requirement: 'Electrical sign-off (BL&P / Chief Electrical Inspector)', status: 'NOT_DONE', responsible: 'Electrical Inspector' },
    { id: 'D8', requirement: 'Public health sign-off (Environmental Health)', status: 'NOT_DONE', responsible: 'Public Health Inspector' },
    { id: 'D9', requirement: 'Fire sign-off (Fire Officer)', status: 'NOT_DONE', responsible: 'Fire Officer' },
  ],
}

// ── Track E: EIA (mandatory >50 rooms + coastal) ──────────────────────
const EIA_TRACK: ApprovalTrack = {
  id: 'E',
  name: 'Environmental Impact Assessment',
  authority: 'Environmental Protection Department (EPA Act)',
  timeline: '4-8 months (can run in parallel with Track A)',
  steps: [
    { id: 'E1', requirement: 'EIA screening request submitted', status: 'NOT_DONE', responsible: 'Environmental Consultant', notes: 'Submitted to EPD to confirm EIA requirement' },
    { id: 'E2', requirement: 'Coastal trigger confirmed (>50 rooms + within CZMU zone)', status: 'NOT_DONE', responsible: 'EPD', notes: 'Mandatory for hotel >50 rooms on coastal site' },
    { id: 'E3', requirement: 'Heritage screening (UNESCO buffer zone)', status: 'NOT_DONE', responsible: 'Barbados Museum / UNESCO Advisory', notes: 'Site within Historic Bridgetown buffer zone' },
    { id: 'E4', requirement: 'Terms of Reference (ToR) agreed with EPD', status: 'NOT_DONE', responsible: 'Environmental Consultant / EPD', notes: 'Defines scope, methodology, and specialist studies required' },
    { id: 'E5', requirement: 'EIS preparation (specialist studies + report)', status: 'NOT_DONE', responsible: 'Environmental Consultant', notes: 'Includes coastal, ecological, socioeconomic, traffic, heritage assessments' },
    { id: 'E6', requirement: 'Public comment period (21 days minimum)', status: 'NOT_DONE', responsible: 'EPD', notes: 'Public notice in newspapers + community consultation' },
    { id: 'E7', requirement: 'EPD review and conditions issued', status: 'NOT_DONE', responsible: 'EPD', blocks: 'A11' },
    { id: 'E8', requirement: 'Conditions framework: avoid / mitigate / offset', status: 'NOT_DONE', responsible: 'Developer / Environmental Consultant', notes: 'Hierarchy: avoid impact first, then mitigate, then offset residual impacts' },
  ],
}

// ── All tracks ────────────────────────────────────────────────────────
export const APPROVAL_TRACKS: ApprovalTrack[] = [
  PLANNING_PERMISSION,
  BUILDING_PERMIT,
  SDA_STATUS,
  TOURISM_DESIGNATION,
  EIA_TRACK,
]

// ── Precedent Projects ────────────────────────────────────────────────
export interface PrecedentProject {
  name: string
  approved: boolean
  scale: string
  relevance: string
}

export const PRECEDENT_PROJECTS: PrecedentProject[] = [
  { name: 'Hyatt Ziva', approved: true, scale: '350+ rooms + 16 branded residences', relevance: 'Confirms large hotel acceptable in SDA' },
  { name: 'Fort Carlisle', approved: true, scale: '9 storeys, ~32 apartments', relevance: 'Confirms 9-storey height in area' },
  { name: 'One Carlisle Tower A', approved: true, scale: '9 storeys, 23 beachfront residences', relevance: 'Confirms 9-storey + mixed use' },
  { name: 'One Carlisle Tower B', approved: true, scale: '9 storeys, 21 residences, ~74,896 sf GFA', relevance: 'Confirms scale' },
]

// ── EIA Issues ────────────────────────────────────────────────────────
export type EIAAssessmentStatus = 'NOT_ASSESSED' | 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'MITIGATED'

export interface EIAIssue {
  issue: string
  relevance: string
  status: EIAAssessmentStatus
}

export const EIA_ISSUES: EIAIssue[] = [
  { issue: 'Coastal erosion and storm surge', relevance: 'Direct - Carlisle Bay frontage', status: 'NOT_ASSESSED' },
  { issue: 'Stormwater drainage', relevance: 'Direct - site drainage design', status: 'NOT_ASSESSED' },
  { issue: 'Marine water quality (construction runoff)', relevance: 'Direct - proximity to bay', status: 'NOT_ASSESSED' },
  { issue: 'Terrestrial ecology (vegetation removal)', relevance: 'Moderate - existing landscaping', status: 'NOT_ASSESSED' },
  { issue: 'Traffic and transport impact', relevance: 'Direct - Bay Street access', status: 'NOT_ASSESSED' },
  { issue: 'Noise and vibration (construction phase)', relevance: 'Direct - adjacent residences', status: 'NOT_ASSESSED' },
  { issue: 'Visual impact and heritage sensitivity', relevance: 'High - UNESCO buffer zone', status: 'NOT_ASSESSED' },
  { issue: 'Socioeconomic impact (employment, displacement)', relevance: 'Moderate - local community', status: 'NOT_ASSESSED' },
  { issue: 'Solid waste and wastewater management', relevance: 'Direct - operational phase', status: 'NOT_ASSESSED' },
]

// ── Helper: compute aggregate progress ────────────────────────────────
export function computeApprovalProgress(tracks: ApprovalTrack[]): {
  total: number
  complete: number
  inProgress: number
  pending: number
  notDone: number
  pct: number
} {
  let total = 0
  let complete = 0
  let inProgress = 0
  let pending = 0
  let notDone = 0

  for (const track of tracks) {
    for (const step of track.steps) {
      total++
      switch (step.status) {
        case 'COMPLETE':
        case 'CONFIRMED':
          complete++
          break
        case 'IN_PROGRESS':
          inProgress++
          break
        case 'PENDING':
          pending++
          break
        default:
          notDone++
      }
    }
  }

  return { total, complete, inProgress, pending, notDone, pct: total > 0 ? Math.round((complete / total) * 100) : 0 }
}
