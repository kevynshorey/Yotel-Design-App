'use client'

import type { LandUseCompass, LandUsePlanCardinal } from '@/lib/land-use-camera'

const BTN =
  'flex h-5 w-5 items-center justify-center rounded border border-slate-600/80 bg-slate-800/90 text-[7px] font-bold text-slate-300 shadow-sm transition hover:border-sky-500/60 hover:bg-slate-700 hover:text-white active:scale-95'

const BTN_TOP =
  'flex h-6 w-11 items-center justify-center rounded border border-slate-500/80 bg-gradient-to-b from-slate-600/90 to-slate-800/90 text-[8px] font-bold tracking-wide text-slate-100 shadow-md transition hover:border-sky-400/70 hover:from-slate-500 hover:to-slate-700'

type Oblique = Exclude<LandUseCompass, 'top'>

interface LandUseViewCubeProps {
  /** 2D plan: cardinals + TOP only; 3D: full diagonal cube */
  mode: '2d' | '3d'
  /** Active plan orientation when mode is 2d (TOP uses default north-up) */
  planCardinal: LandUsePlanCardinal
  /** Active oblique direction in 3d (ignored in 2d except when showing highlight for TOP) */
  compass3D: LandUseCompass
  onTop: () => void
  onPlanCardinal: (c: LandUsePlanCardinal) => void
  onCompass3D: (c: Oblique) => void
  className?: string
}

export function LandUseViewCube({
  mode,
  planCardinal,
  compass3D,
  onTop,
  onPlanCardinal,
  onCompass3D,
  className,
}: LandUseViewCubeProps) {
  if (mode === '2d') {
    const hi = (c: LandUsePlanCardinal) => planCardinal === c

    return (
      <div
        className={`pointer-events-auto select-none rounded-lg border border-slate-700/90 bg-slate-950/85 p-1.5 shadow-lg backdrop-blur-sm ${className ?? ''}`}
        role="group"
        aria-label="Plan orientation"
      >
        <p className="mb-1 text-center text-[8px] font-semibold uppercase tracking-wider text-slate-500">Plan</p>
        <div className="flex flex-col items-center gap-0.5">
          <button
            type="button"
            className={BTN}
            style={{ boxShadow: hi('N') ? '0 0 0 2px rgba(56,189,248,0.55)' : undefined, opacity: hi('N') ? 1 : 0.88 }}
            title="North up"
            onClick={() => onPlanCardinal('N')}
          >
            N
          </button>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              className={BTN}
              style={{ boxShadow: hi('W') ? '0 0 0 2px rgba(56,189,248,0.55)' : undefined, opacity: hi('W') ? 1 : 0.88 }}
              title="West up"
              onClick={() => onPlanCardinal('W')}
            >
              W
            </button>
            <button
              type="button"
              className={BTN_TOP}
              title="Plan top — reset to north-up"
              onClick={onTop}
            >
              TOP
            </button>
            <button
              type="button"
              className={BTN}
              style={{ boxShadow: hi('E') ? '0 0 0 2px rgba(56,189,248,0.55)' : undefined, opacity: hi('E') ? 1 : 0.88 }}
              title="East up"
              onClick={() => onPlanCardinal('E')}
            >
              E
            </button>
          </div>
          <button
            type="button"
            className={BTN}
            style={{ boxShadow: hi('S') ? '0 0 0 2px rgba(56,189,248,0.55)' : undefined, opacity: hi('S') ? 1 : 0.88 }}
            title="South up"
            onClick={() => onPlanCardinal('S')}
          >
            S
          </button>
        </div>
      </div>
    )
  }

  const hi = (d: LandUseCompass) => {
    if (d === 'top') return compass3D === 'top'
    return compass3D === d
  }

  return (
    <div
      className={`pointer-events-auto select-none rounded-lg border border-slate-700/90 bg-slate-950/85 p-1.5 shadow-lg backdrop-blur-sm ${className ?? ''}`}
      role="group"
      aria-label="View cube"
    >
      <p className="mb-1 text-center text-[8px] font-semibold uppercase tracking-wider text-slate-500">View</p>
      <div className="grid w-[76px] grid-cols-3 gap-0.5">
        <button type="button" className={BTN} style={{ opacity: hi('NW') ? 1 : 0.85 }} title="NW" onClick={() => onCompass3D('NW')}>
          NW
        </button>
        <button type="button" className={BTN} style={{ opacity: hi('N') ? 1 : 0.85 }} title="North" onClick={() => onCompass3D('N')}>
          N
        </button>
        <button type="button" className={BTN} style={{ opacity: hi('NE') ? 1 : 0.85 }} title="NE" onClick={() => onCompass3D('NE')}>
          NE
        </button>

        <button type="button" className={BTN} style={{ opacity: hi('W') ? 1 : 0.85 }} title="West" onClick={() => onCompass3D('W')}>
          W
        </button>
        <button
          type="button"
          className={BTN_TOP}
          style={{
            boxShadow: hi('top') ? '0 0 0 2px rgba(56,189,248,0.55)' : undefined,
          }}
          title="Plan (top)"
          onClick={onTop}
        >
          TOP
        </button>
        <button type="button" className={BTN} style={{ opacity: hi('E') ? 1 : 0.85 }} title="East" onClick={() => onCompass3D('E')}>
          E
        </button>

        <button type="button" className={BTN} style={{ opacity: hi('SW') ? 1 : 0.85 }} title="SW" onClick={() => onCompass3D('SW')}>
          SW
        </button>
        <button type="button" className={BTN} style={{ opacity: hi('S') ? 1 : 0.85 }} title="South" onClick={() => onCompass3D('S')}>
          S
        </button>
        <button type="button" className={BTN} style={{ opacity: hi('SE') ? 1 : 0.85 }} title="SE" onClick={() => onCompass3D('SE')}>
          SE
        </button>
      </div>
    </div>
  )
}
