/**
 * Mt Brevitor Estates — Residential Clusters (A-G)
 * Source: MBE_B2_ResidentialConfiguration_v2.0
 * Revised: Cluster F added in NW zone (freed by X Range relocation to farm)
 * Revised: Cluster G added on eastern cleared hilltop (south section) — Phase 4 alongside E
 * Total: 485 units across 7 clusters
 */

import type { ResidentialCluster } from '../types'

export const CLUSTERS: ResidentialCluster[] = [
  {
    id: 'A',
    label: 'Entry / Mid',
    tier: 'entry',
    acresMin: 12, acresMax: 14,
    unitsMin: 100, unitsMax: 110,
    products: ['condo_1bed', 'townhouse_2bed'],
    targetBuyer: 'Local first-time buyers, regional investors (BBD 60K-150K household income)',
    densityMin: 7, densityMax: 8,
    phase: 1,
    color: '#3b82f6',
  },
  {
    id: 'B',
    label: 'Mid-Range',
    tier: 'mid',
    acresMin: 12, acresMax: 14,
    unitsMin: 90, unitsMax: 100,
    products: ['townhouse_2bed', 'townhouse_3bed'],
    targetBuyer: 'Local upgraders, Barbadian diaspora (UK/North America)',
    densityMin: 6, densityMax: 7,
    phase: 2,
    color: '#6366f1',
  },
  {
    id: 'C',
    label: 'Mid-Upper',
    tier: 'mid_upper',
    acresMin: 10, acresMax: 12,
    unitsMin: 70, unitsMax: 80,
    products: ['townhouse_3bed', 'home_4bed'],
    targetBuyer: 'Established families, diaspora, international remote workers',
    densityMin: 6, densityMax: 7,
    phase: 2,
    color: '#8b5cf6',
  },
  {
    id: 'D',
    label: 'Upper',
    tier: 'upper',
    acresMin: 10, acresMax: 12,
    unitsMin: 45, unitsMax: 55,
    products: ['home_4bed'],
    targetBuyer: 'Upper-income local, international buyers',
    densityMin: 4, densityMax: 5,
    phase: 3,
    color: '#a855f7',
  },
  {
    id: 'E',
    label: 'Premium',
    tier: 'premium',
    acresMin: 10, acresMax: 12,
    unitsMin: 30, unitsMax: 40,
    products: ['estate_5bed'],
    targetBuyer: 'International HNW, diaspora, Welcome Stamp holders',
    densityMin: 3, densityMax: 4,
    phase: 4,
    color: '#d946ef',
  },
  {
    id: 'F',
    label: 'Mid-Range NW',
    tier: 'mid',
    acresMin: 7, acresMax: 8,
    unitsMin: 45, unitsMax: 50,
    products: ['townhouse_2bed', 'townhouse_3bed'],
    targetBuyer: 'Local upgraders, diaspora, remote workers. YOTEL-ready zone if brand deal closes.',
    densityMin: 6, densityMax: 7,
    phase: 2,
    color: '#10b981',
  },
  {
    id: 'G',
    label: 'The Hilltop',
    tier: 'upper',
    acresMin: 10, acresMax: 12,
    unitsMin: 45, unitsMax: 55,
    products: ['townhouse_3bed', 'home_4bed', 'estate_5bed'],
    targetBuyer: 'International buyers, HNW diaspora, altitude-premium seekers. 270° Caribbean panoramic views. Between the edge character of D and the deep premium of E.',
    densityMin: 4, densityMax: 5,
    phase: 4,
    color: '#f59e0b',
  },
]
