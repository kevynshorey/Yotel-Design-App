import { SUSTAINABILITY } from '@/config/sustainability'
import type { OptionMetrics } from './types'

export interface SustainabilityMetrics {
  renewableEnergyPct: number
  waterEfficiencyPct: number
  embodiedCarbonKgM2: number
  operationalEnergyKwhM2: number
  edgeScore: number // 0-100
}

export function calculateSustainability(metrics: OptionMetrics): SustainabilityMetrics {
  const { energy, water, carbon } = SUSTAINABILITY

  // Renewable energy coverage
  const renewableEnergyPct = Math.min(1, energy.annualGenerationKwh / energy.buildingLoadKwh)

  // Water efficiency (greywater + rainwater vs baseline)
  const annualGuestNights = (metrics.yotelKeys * 365 * 0.78) + (metrics.padUnits * 365 * 0.75)
  const baselineDemand = annualGuestNights * water.baselineLitresPerGuestNight
  const recycled = baselineDemand * water.greyWaterRecyclingPct
  const rainwater = water.rainwaterCaptureM3 * 1000 // convert to litres
  const waterEfficiencyPct = Math.min(1, (recycled + rainwater) / baselineDemand)

  // Embodied carbon (simplified)
  const structuralMass = metrics.gia * 0.45 // tonnes per m² (modular steel frame)
  const steelTonnes = structuralMass * 0.55
  const concreteTonnes = structuralMass * 0.35
  const embodiedCo2 = (steelTonnes * carbon.steelFactor) + (concreteTonnes * carbon.concreteFactor)
  const embodiedCarbonKgM2 = (embodiedCo2 * 1000) / metrics.gia

  // Operational energy
  const operationalEnergyKwhM2 = energy.buildingLoadKwh / metrics.gia

  // EDGE score (0-100): weighted composite
  const energyScore = Math.min(100, (renewableEnergyPct / 0.35) * 30 + (1 - operationalEnergyKwhM2 / 200) * 20)
  const waterScore = Math.min(100, (waterEfficiencyPct / 0.40) * 25)
  const carbonScore = Math.min(100, (1 - embodiedCarbonKgM2 / carbon.embodiedTarget) * 25)
  const edgeScore = Math.round(Math.max(0, energyScore + waterScore + carbonScore))

  return { renewableEnergyPct, waterEfficiencyPct, embodiedCarbonKgM2, operationalEnergyKwhM2, edgeScore }
}
