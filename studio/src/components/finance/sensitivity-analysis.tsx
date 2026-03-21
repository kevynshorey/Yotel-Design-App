'use client'

interface SensitivityAnalysisProps {
  baseNoi: number
  baseTdc: number
  baseYieldOnCost: number
  baseGopMargin: number
  baseRevPar: number
  baseCostPerKey: number
  totalKeys: number
  ytRooms: number
  padUnits: number
  onAdrAdjust: (pct: number) => void
  onOccAdjust: (pct: number) => void
  onCostAdjust: (pct: number) => void
  adrAdjust: number
  occAdjust: number
  costAdjust: number
}

function usd(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US')
}

function pct(n: number, decimals = 2): string {
  return (n * 100).toFixed(decimals) + '%'
}

function signedPct(n: number): string {
  const val = (n * 100).toFixed(0)
  return n >= 0 ? `+${val}%` : `${val}%`
}

const ADR_STEPS = [-0.10, 0, 0.10, 0.20]
const COST_STEPS = [-0.10, 0, 0.10, 0.20]

function yieldColor(y: number): string {
  if (y >= 0.10) return 'text-emerald-400 bg-emerald-500/10'
  if (y >= 0.07) return 'text-sky-400 bg-sky-500/10'
  if (y >= 0.05) return 'text-amber-400 bg-amber-500/10'
  return 'text-red-400 bg-red-500/10'
}

export function SensitivityAnalysis({
  baseNoi,
  baseTdc,
  baseYieldOnCost,
  baseGopMargin,
  baseRevPar,
  baseCostPerKey,
  totalKeys,
  adrAdjust,
  occAdjust,
  costAdjust,
  onAdrAdjust,
  onOccAdjust,
  onCostAdjust,
}: SensitivityAnalysisProps) {
  // Compute adjusted values for the impact summary
  const adjustedNoi = baseNoi * (1 + adrAdjust) * (1 + occAdjust)
  const adjustedTdc = baseTdc * (1 + costAdjust)
  const adjustedYield = adjustedTdc > 0 ? adjustedNoi / adjustedTdc : 0
  const adjustedCostPerKey = totalKeys > 0 ? adjustedTdc / totalKeys : 0

  const noiDelta = adjustedNoi - baseNoi
  const tdcDelta = adjustedTdc - baseTdc
  const yieldDelta = adjustedYield - baseYieldOnCost
  const cpkDelta = adjustedCostPerKey - baseCostPerKey

  // Compute matrix cell: yield for a given ADR and cost adjustment
  function matrixYield(adrAdj: number, costAdj: number): number {
    const noi = baseNoi * (1 + adrAdj) * (1 + occAdjust)
    const tdc = baseTdc * (1 + costAdj)
    return tdc > 0 ? noi / tdc : 0
  }

  // Check if a matrix cell matches the current slider position
  function isCurrent(adrAdj: number, costAdj: number): boolean {
    return (
      Math.abs(adrAdj - adrAdjust) < 0.001 &&
      Math.abs(costAdj - costAdjust) < 0.001
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        Sensitivity Analysis
      </p>

      {/* Sliders */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SliderControl
          label="ADR Adjustment"
          value={adrAdjust}
          onChange={onAdrAdjust}
        />
        <SliderControl
          label="Occupancy Adjustment"
          value={occAdjust}
          onChange={onOccAdjust}
        />
        <SliderControl
          label="Construction Cost Adjustment"
          value={costAdjust}
          onChange={onCostAdjust}
        />
      </div>

      {/* Sensitivity Matrix */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Yield on Cost Matrix — ADR vs Construction Cost
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="pb-2 pr-3 text-left font-medium text-slate-500">
                  ADR \ Cost
                </th>
                {COST_STEPS.map((c) => (
                  <th
                    key={c}
                    className="pb-2 px-2 text-center font-medium text-slate-400"
                  >
                    {c === 0 ? 'Base' : signedPct(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ADR_STEPS.map((a) => (
                <tr key={a}>
                  <td className="py-1.5 pr-3 font-medium text-slate-400">
                    {a === 0 ? 'Base ADR' : `ADR ${signedPct(a)}`}
                  </td>
                  {COST_STEPS.map((c) => {
                    const y = matrixYield(a, c)
                    const current = isCurrent(a, c)
                    return (
                      <td key={c} className="py-1.5 px-2 text-center">
                        <span
                          className={`inline-block rounded px-2 py-1 font-mono font-semibold ${yieldColor(y)} ${
                            current ? 'ring-2 ring-sky-400' : ''
                          }`}
                        >
                          {pct(y, 1)}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {occAdjust !== 0 && (
          <p className="mt-2 text-[10px] text-slate-500">
            * Matrix reflects current occupancy adjustment of {signedPct(occAdjust)}
          </p>
        )}
      </div>

      {/* Impact Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ImpactTile
          label="Adjusted TDC"
          value={usd(adjustedTdc)}
          delta={tdcDelta}
          invertColor
        />
        <ImpactTile
          label="Adjusted NOI"
          value={usd(adjustedNoi)}
          delta={noiDelta}
        />
        <ImpactTile
          label="Adjusted Yield"
          value={pct(adjustedYield)}
          delta={yieldDelta}
          isPct
        />
        <ImpactTile
          label="Adjusted Cost/Key"
          value={usd(adjustedCostPerKey)}
          delta={cpkDelta}
          invertColor
        />
      </div>
    </div>
  )
}

function SliderControl({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <span
          className={`font-mono text-xs font-bold ${
            value === 0
              ? 'text-slate-400'
              : value > 0
                ? 'text-amber-400'
                : 'text-emerald-400'
          }`}
        >
          {value >= 0 ? '+' : ''}
          {(value * 100).toFixed(0)}%
        </span>
      </div>
      <input
        type="range"
        min={-20}
        max={20}
        step={5}
        value={value * 100}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-sky-500"
      />
      <div className="flex justify-between text-[9px] text-slate-600">
        <span>-20%</span>
        <span>0</span>
        <span>+20%</span>
      </div>
    </div>
  )
}

function ImpactTile({
  label,
  value,
  delta,
  invertColor,
  isPct,
}: {
  label: string
  value: string
  delta: number
  invertColor?: boolean
  isPct?: boolean
}) {
  const isPositive = delta > 0
  const isNegative = delta < 0
  const isNeutral = Math.abs(delta) < 0.001

  // For costs, positive delta is bad (red), negative is good (green)
  // For revenue/yield, positive delta is good (green), negative is bad (red)
  let colorClass = 'text-slate-500'
  if (!isNeutral) {
    if (invertColor) {
      colorClass = isPositive ? 'text-red-400' : 'text-emerald-400'
    } else {
      colorClass = isPositive ? 'text-emerald-400' : 'text-red-400'
    }
  }

  const deltaStr = isPct
    ? `${isPositive ? '+' : ''}${(delta * 100).toFixed(2)}pp`
    : `${isPositive ? '+' : ''}${usd(delta)}`

  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="font-mono text-sm font-bold leading-tight text-slate-100">
        {value}
      </span>
      <span className={`text-[10px] font-mono ${colorClass}`}>
        {isNeutral ? 'base case' : deltaStr}
      </span>
    </div>
  )
}
