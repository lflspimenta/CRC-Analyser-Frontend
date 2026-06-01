'use client'

import { useState } from 'react'
import type { Recomendacao } from '@/types'

// ── Recomendações ─────────────────────────────────────────────────────────────

const impactoStyles: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  critico: { label: 'Crítico',    bg: 'rgba(239,68,68,0.12)',  text: '#fca5a5', dot: '#ef4444' },
  alto:    { label: 'Alto',       bg: 'rgba(212,168,71,0.12)', text: '#fcd34d', dot: '#d4a847' },
  medio:   { label: 'Médio',      bg: 'rgba(99,102,241,0.12)', text: '#a5b4fc', dot: '#6366f1' },
  baixo:   { label: 'Baixo',      bg: 'rgba(34,197,94,0.12)',  text: '#86efac', dot: '#22c55e' },
}

export function Recomendacoes({ recomendacoes }: { recomendacoes: Recomendacao[] }) {
  if (recomendacoes.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-400 text-sm">Nenhuma recomendação gerada.</p>
      </div>
    )
  }

  return (
    <div className="stagger space-y-4">
      <div>
        <h2 className="text-stone-200 font-medium mb-1">Soluções recomendadas</h2>
        <p className="text-sm text-stone-500">Ordenadas por prioridade e impacto financeiro</p>
      </div>
      {recomendacoes.map((r, i) => {
        const s = impactoStyles[r.impacto] || impactoStyles.baixo
        return (
          <div key={i} className="rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                  style={{ background: s.bg, color: s.text }}>
                  {i + 1}
                </span>
                <h3 className="text-stone-200 font-medium text-sm">{r.titulo}</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
                style={{ background: s.bg, color: s.text }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                {s.label}
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed mb-3">{r.descricao}</p>
            {r.valor_estimado && r.valor_estimado > 0 && (
              <p className="text-xs text-stone-600">
                Valor envolvido:{' '}
                <span className="text-stone-400">
                  {r.valor_estimado.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} €
                </span>
              </p>
            )}
            {r.instituicoes && r.instituicoes.length > 0 && (
              <p className="text-xs text-stone-600 mt-1">
                Instituição(ões): <span className="text-stone-400">{r.instituicoes.join(', ')}</span>
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
export default Recomendacoes

// ── Simulador ─────────────────────────────────────────────────────────────────

export function Simulador({
  prestacaoActual,
  rendimento,
}: {
  prestacaoActual: number
  rendimento: number
}) {
  const [montante, setMontante] = useState(100000)
  const [prazo, setPrazo] = useState(30)
  const [taxa, setTaxa] = useState(3.5)

  const rateM = taxa / 100 / 12
  const n = prazo * 12
  const pmt = rateM === 0
    ? montante / n
    : (montante * rateM * Math.pow(1 + rateM, n)) / (Math.pow(1 + rateM, n) - 1)

  const totalPrest = prestacaoActual + pmt
  const te = rendimento > 0 ? (totalPrest / rendimento) * 100 : 0

  const verdict =
    te <= 35 ? { text: 'Aprovação provável', color: '#22c55e', icon: '✅' } :
    te <= 45 ? { text: 'Aprovação incerta', color: '#d4a847', icon: '⚠️' } :
    { text: 'Aprovação improvável', color: '#ef4444', icon: '❌' }

  return (
    <div className="stagger space-y-6">
      <div>
        <h2 className="text-stone-200 font-medium mb-1">Simulador de novo crédito</h2>
        <p className="text-sm text-stone-500">
          Vê como um crédito adicional afectaria a tua taxa de esforço,
          com base nas prestações actuais de{' '}
          <span className="text-stone-300">{prestacaoActual.toFixed(2)} €/mês</span>.
        </p>
      </div>

      <div className="rounded-xl p-5 space-y-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

        <Slider
          label="Montante"
          min={5000} max={500000} step={5000}
          value={montante}
          display={`${montante.toLocaleString('pt-PT')} €`}
          onChange={setMontante}
        />
        <Slider
          label="Prazo"
          min={5} max={40} step={1}
          value={prazo}
          display={`${prazo} anos`}
          onChange={setPrazo}
        />
        <Slider
          label="Taxa TAEG"
          min={0.5} max={15} step={0.1}
          value={taxa}
          display={`${taxa.toFixed(1)}%`}
          onChange={v => setTaxa(Math.round(v * 10) / 10)}
        />
      </div>

      {/* Resultado */}
      <div className="rounded-xl p-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-xs text-stone-600 uppercase tracking-wider mb-4">Resultado</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <ResultField label="Prestação nova" value={`${Math.round(pmt).toLocaleString('pt-PT')} €/mês`} />
          <ResultField label="Prestações actuais" value={`${prestacaoActual.toFixed(0)} €/mês`} />
          <ResultField label="Total mensal" value={`${Math.round(totalPrest).toLocaleString('pt-PT')} €/mês`} />
          <ResultField label="Taxa de esforço" value={`${te.toFixed(1)}%`} highlight />
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: `${verdict.color}18`, border: `1px solid ${verdict.color}30` }}>
          <span className="text-lg">{verdict.icon}</span>
          <div>
            <p className="font-medium text-sm" style={{ color: verdict.color }}>{verdict.verdict}</p>
            <p className="text-xs text-stone-500 mt-0.5">
              {te <= 35
                ? 'A taxa de esforço fica dentro dos limites prudenciais dos bancos portugueses.'
                : te <= 45
                ? 'Alguns bancos podem aprovar mas as condições serão mais restritivas.'
                : 'A taxa de esforço ultrapassa o limite prudencial. Considera reduzir o montante ou alargar o prazo.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Slider({ label, min, max, step, value, display, onChange }: {
  label: string; min: number; max: number; step: number
  value: number; display: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-2">
        <span className="text-stone-500">{label}</span>
        <span className="text-stone-200 font-medium">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-amber-400 cursor-pointer"
        style={{ accentColor: 'var(--accent)' }}
      />
    </div>
  )
}

function ResultField({ label, value, highlight }: {
  label: string; value: string; highlight?: boolean
}) {
  return (
    <div>
      <p className="text-xs text-stone-600 mb-1">{label}</p>
      <p className={`text-sm font-medium ${highlight ? 'text-amber-400' : 'text-stone-200'}`}>{value}</p>
    </div>
  )
}
