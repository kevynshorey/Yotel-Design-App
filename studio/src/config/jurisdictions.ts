// ============================================================================
// JURISDICTION-BASED REGULATORY ENGINE
// Enables multi-market compliance checking beyond Barbados.
//
// Each jurisdiction captures the key planning parameters needed by the
// validator and planning dashboard. Values are sourced from:
//   - Barbados: existing rules.ts (exact copy)
//   - Jamaica: NEPA, UDC, Kingston Building Act research estimates
//   - Cayman Islands: Planning Department, National Building Code
//   - Trinidad & Tobago: TCPD, EMA, TT Building Code
//   - Bahamas: Ministry of Works, Building Control Division
// ============================================================================

export interface Jurisdiction {
  id: string
  name: string
  country: string
  region: string
  planningAuthority: string
  /** Maximum building height in metres */
  maxHeight: number
  /** Maximum number of storeys */
  maxStoreys: number
  /** Maximum site coverage ratio (0-1) */
  maxCoverage: number
  /** Minimum side/rear setback in metres */
  minSetback: number
  /** Coastal setback from high water mark in metres */
  coastalSetback: number
  /** Parking spaces per hotel key */
  parkingRatio: number
  /** Minimum percentage of rooms that must be accessible (0-1) */
  accessiblePercent: number
  /** Minimum percentage of site that must be landscaped (0-1) */
  landscapePercent: number
  /** Number of hotel keys that triggers an EIA requirement */
  eiaThreshold: number
  /** Summary of fire regulation standards */
  fireRegulations: string
  /** Key utility providers */
  utilityProviders: string[]
  /** Applicable building code */
  buildingCode: string
  /** Special planning zones that may apply */
  specialZones: string[]
}

// ── Barbados ─────────────────────────────────────────────────────────────
// Exact values from rules.ts — the current project baseline.
const BARBADOS: Jurisdiction = {
  id: 'bb',
  name: 'Barbados',
  country: 'Barbados',
  region: 'Eastern Caribbean',
  planningAuthority: 'Town and Country Planning Department (TCPD)',
  maxHeight: 22.0,
  maxStoreys: 6,
  maxCoverage: 0.50,
  minSetback: 1.83,
  coastalSetback: 30.0,
  parkingRatio: 0.5,
  accessiblePercent: 0.05,
  landscapePercent: 0.15,
  eiaThreshold: 50,
  fireRegulations: 'Barbados Fire Service + NFPA Standards',
  utilityProviders: ['Barbados Water Authority (BWA)', 'Barbados Light & Power (BL&P)'],
  buildingCode: 'Barbados Building Standards (CUBiC-adapted) + NFPA',
  specialZones: ['UNESCO World Heritage Buffer Zone', 'CZMU Coastal Zone'],
}

// ── Jamaica ──────────────────────────────────────────────────────────────
// Sources: NEPA, Urban Development Corporation (UDC), Kingston Building Act,
// Town and Country Planning Authority (TCPA Jamaica).
const JAMAICA: Jurisdiction = {
  id: 'jm',
  name: 'Jamaica',
  country: 'Jamaica',
  region: 'Western Caribbean',
  planningAuthority: 'National Environment and Planning Agency (NEPA) / UDC',
  maxHeight: 45.0,
  maxStoreys: 12,
  maxCoverage: 0.60,
  minSetback: 1.5,
  coastalSetback: 50.0,
  parkingRatio: 0.5,
  accessiblePercent: 0.05,
  landscapePercent: 0.15,
  eiaThreshold: 50,
  fireRegulations: 'Jamaica Fire Brigade + International Building Code (IBC)',
  utilityProviders: ['National Water Commission (NWC)', 'Jamaica Public Service (JPS)'],
  buildingCode: 'Jamaica National Building Code (JNBC)',
  specialZones: ['Beach Control Area', 'Special Fishery Conservation Area'],
}

// ── Cayman Islands ───────────────────────────────────────────────────────
// Sources: Planning Department, National Building Code of the Cayman Islands,
// Development and Planning Regulations (2021 revision).
const CAYMAN_ISLANDS: Jurisdiction = {
  id: 'ky',
  name: 'Cayman Islands',
  country: 'Cayman Islands',
  region: 'Western Caribbean',
  planningAuthority: 'Department of Planning, Ministry of Planning',
  maxHeight: 40.0,
  maxStoreys: 10,
  maxCoverage: 0.55,
  minSetback: 1.52,
  coastalSetback: 39.6,
  parkingRatio: 0.75,
  accessiblePercent: 0.05,
  landscapePercent: 0.20,
  eiaThreshold: 30,
  fireRegulations: 'Cayman Islands Fire Service + IBC / NFPA',
  utilityProviders: ['Water Authority Cayman (WAC)', 'Caribbean Utilities Company (CUC)'],
  buildingCode: 'National Building Code of the Cayman Islands (2021)',
  specialZones: ['Seven Mile Beach Zone', 'Marine Park Buffer', 'Environmental Zone'],
}

// ── Trinidad & Tobago ────────────────────────────────────────────────────
// Sources: Town and Country Planning Division (TCPD), Environmental
// Management Authority (EMA), TT Building Code.
const TRINIDAD_TOBAGO: Jurisdiction = {
  id: 'tt',
  name: 'Trinidad & Tobago',
  country: 'Trinidad and Tobago',
  region: 'Southern Caribbean',
  planningAuthority: 'Town and Country Planning Division (TCPD)',
  maxHeight: 36.0,
  maxStoreys: 10,
  maxCoverage: 0.60,
  minSetback: 1.8,
  coastalSetback: 30.0,
  parkingRatio: 0.5,
  accessiblePercent: 0.05,
  landscapePercent: 0.15,
  eiaThreshold: 50,
  fireRegulations: 'Trinidad and Tobago Fire Service + NFPA',
  utilityProviders: ['Water and Sewerage Authority (WASA)', 'T&TEC'],
  buildingCode: 'Trinidad and Tobago Building Code (ODPM)',
  specialZones: ['Environmentally Sensitive Area (ESA)', 'Hillside Development Zone'],
}

// ── Bahamas ──────────────────────────────────────────────────────────────
// Sources: Ministry of Works and Utilities, Building Control Division,
// Nassau Development Control Regulations.
const BAHAMAS: Jurisdiction = {
  id: 'bs',
  name: 'Bahamas',
  country: 'The Bahamas',
  region: 'Northern Caribbean',
  planningAuthority: 'Department of Physical Planning, Ministry of Works',
  maxHeight: 30.0,
  maxStoreys: 8,
  maxCoverage: 0.50,
  minSetback: 1.52,
  coastalSetback: 30.5,
  parkingRatio: 0.5,
  accessiblePercent: 0.05,
  landscapePercent: 0.15,
  eiaThreshold: 50,
  fireRegulations: 'Royal Bahamas Police Force Fire Services + IBC',
  utilityProviders: ['Water and Sewerage Corporation (WSC)', 'Bahamas Power and Light (BPL)'],
  buildingCode: 'Bahamas Building Code (IBC-adapted)',
  specialZones: ['National Park Buffer', 'Coastal Protection Zone'],
}

// ── Exports ──────────────────────────────────────────────────────────────

export const JURISDICTIONS: Jurisdiction[] = [
  BARBADOS,
  JAMAICA,
  CAYMAN_ISLANDS,
  TRINIDAD_TOBAGO,
  BAHAMAS,
]

/** Look up a jurisdiction by its 2-letter id. Returns undefined if not found. */
export function getJurisdiction(id: string): Jurisdiction | undefined {
  return JURISDICTIONS.find((j) => j.id === id)
}

/** Return an array of { id, name } for populating selector dropdowns. */
export function getJurisdictionNames(): { id: string; name: string }[] {
  return JURISDICTIONS.map((j) => ({ id: j.id, name: j.name }))
}
