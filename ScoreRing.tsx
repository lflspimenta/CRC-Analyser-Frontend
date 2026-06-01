'use client'

// ── ScoreRing ─────────────────────────────────────────────────────────────────
export function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <div className="relative w-28 h-28">
      <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="56" cy="56" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="score-ring transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-display text-stone-50">{score}</span>
        <span className="text-xs text-stone-600">/100</span>
      </div>
    </div>
  )
}
export default ScoreRing

// ── MetricCard ────────────────────────────────────────────────────────────────
const statusColors = {
  ok:      { text: '#22c55e', bg: 'rgba(34,197,94,0.12)',  bar: '#22c55e' },
  warn:    { text: '#d4a847', bg: 'rgba(212,168,71,0.12)', bar: '#d4a847' },
  crit:    { text: '#ef4444', bg: 'rgba(239,68,68,0.12)',  bar: '#ef4444' },
  neutral: { text: '#a8a29e', bg: 'transparent',           bar: '#a8a29e' },
}

export function MetricCard({ label, value, status, bar, hint }: {
  label: string
  value: string
  status: 'ok' | 'warn' | 'crit' | 'neutral'
  bar?: { value: number; max: number }
  hint?: string
}) {
  const c = statusColors[status]
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <p className="text-xs text-stone-600 mb-2">{label}</p>
      <p className="text-xl font-display mb-2" style={{ color: c.text }}>{value}</p>
      {bar && (
        <div className="h-1 rounded-full mb-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full bar-fill"
            style={{ width: `${Math.min(100, (bar.value / bar.max) * 100)}%`, background: c.bar }}
          />
        </div>
      )}
      {hint && <p className="text-xs text-stone-700">{hint}</p>}
    </div>
  )
}

// ── AlertaBadge ───────────────────────────────────────────────────────────────
const nivelStyles = {
  info: { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', icon: '💡', text: 'text-indigo-300' },
  warn: { bg: 'rgba(212,168,71,0.1)', border: 'rgba(212,168,71,0.2)', icon: '⚠️', text: 'text-amber-300' },
  crit: { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)',  icon: '🔴', text: 'text-red-300' },
}

export function AlertaBadge({ alerta }: { alerta: { nivel: 'info'|'warn'|'crit'; msg: string } }) {
  const s = nivelStyles[alerta.nivel]
  return (
    <div className={`flex gap-2.5 px-3 py-2.5 rounded-xl text-sm ${s.text}`}
      style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <span className="text-base flex-shrink-0 mt-px">{s.icon}</span>
      <span className="leading-snug">{alerta.msg}</span>
    </div>
  )
}
export default AlertaBadge
