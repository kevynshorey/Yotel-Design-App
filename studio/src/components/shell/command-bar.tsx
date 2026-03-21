export function CommandBar() {
  return (
    <div className="flex h-10 items-center justify-between border-b border-[rgba(0,0,0,0.08)] bg-white/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-900">YOTEL Barbados</span>
        <span className="text-xs text-slate-500">Carlisle Bay, Bridgetown</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="font-mono">130 keys</span>
        <span>·</span>
        <span className="font-mono">$40M TDC</span>
      </div>
    </div>
  )
}
