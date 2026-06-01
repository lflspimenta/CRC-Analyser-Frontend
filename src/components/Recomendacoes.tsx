'use client'

import { useState } from 'react'
import type { Recomendacao } from '@/types'

const impactoStyles: Record<string, { label: string; bg: string; text: string }> = {
  critico: { label: 'Critico', bg: 'rgba(239,68,68,0.12)',  text: '#fca5a5' },
  alto:    { label: 'Alto',    bg: 'rgba(212,168,71,0.12)', text: '#fcd34d' },
  medio:   { label: 'Medio',   bg: 'rgba(99,102,241,0.12)', text: '#a5b4fc' },
  baixo:   { label: 'Baixo',   bg: 'rgba(34,197,94,0.12)',  text: '#86efac' },
}

export function Recomendacoes({ recomendacoes }: { recomendacoes: Recomendacao[] }) {
  if (!recomendacoes.length) return <p className="text-stone-500 text-sm py-16 text-center">Nenhuma recomendacao.</p>
  return (
    <div className="stagger space-y-4">
      <div>
        <h2 className="text-stone-200 font-medium mb-1">Solucoes recomendadas</h2>
        <p className="text-sm text-stone-500">Ordenadas por prioridade</p>
      </div>
      {recomendacoes.map((r,i) => {
        const s = impactoStyles[r.impacto] || impactoStyles.baixo
        return (
          <div key={i} className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium"
                  style={{ background: s.bg, color: s.text }}>{i+1}</span>
                <h3 className="text-stone-200 font-medium text-sm">{r.titulo}</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: s.bg, color: s.text }}>{s.label}</span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">{r.descricao}</p>
            {r.valor_estimado && r.valor_estimado > 0 && (
              <p className="text-xs text-stone-600 mt-2">
                Valor: <span className="text-stone-400">{r.valor_estimado.toFixed(2)} E</span>
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
export default Recomendacoes

export function Simulador({ prestacaoActual, rendimento }: { prestacaoActual: number; rendimento: number }) {
  const [montante, setMontante] = useState(100000)
  const [prazo, setPrazo]       = useState(30)
  const [taxa, setTaxa]         = useState(3.5)

  const rateM = taxa / 100 / 12
  const n = prazo * 12
  const pmt = rateM === 0 ? montante/n : (montante*rateM*Math.pow(1+rateM,n))/(Math.pow(1+rateM,n)-1)
  const te = rendimento > 0 ? ((prestacaoActual + pmt) / rendimento) * 100 : 0

  const verdict =
    te <= 35 ? { text: 'Aprovacao provavel', color: '#22c55e' } :
    te <= 45 ? { text: 'Aprovacao incerta',  color: '#d4a847' } :
               { text: 'Aprovacao improvavel', color: '#ef4444' }

  return (
    <div className="stagger space-y-6">
      <div>
        <h2 className="text-stone-200 font-medium mb-1">Simulador de novo credito</h2>
        <p className="text-sm text-stone-500">
          Prestacoes actuais: <span className="text-stone-300">{prestacaoActual.toFixed(2)} E/mes</span>
        </p>
      </div>
      <div className="rounded-xl p-5 space-y-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {[
          { label: 'Montante', min: 5000, max: 500000, step: 5000, val: montante, set: setMontante, fmt: (v: number) => `${v.toLocaleString('pt-PT')} E` },
          { label: 'Prazo (anos)', min: 5, max: 40, step: 1, val: prazo, set: setPrazo, fmt: (v: number) => `${v} anos` },
          { label: 'Taxa TAEG %', min: 0.5, max: 15, step: 0.1, val: taxa, set: setTaxa, fmt: (v: number) => `${v.toFixed(1)}%` },
        ].map(s => (
          <div key={s.label}>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-stone-500">{s.label}</span>
              <span className="text-stone-200 font-medium">{s.fmt(s.val)}</span>
            </div>
            <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
              onChange={e => s.set(Number(e.target.value) as any)}
              className="w-full cursor-pointer" style={{ accentColor: 'var(--accent)' }}/>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <div><p className="text-xs text-stone-600 mb-1">Prestacao nova</p><p className="text-stone-200 font-medium text-sm">{Math.round(pmt).toLocaleString('pt-PT')} E/mes</p></div>
          <div><p className="text-xs text-stone-600 mb-1">Total mensal</p><p className="text-stone-200 font-medium text-sm">{Math.round(prestacaoActual+pmt).toLocaleString('pt-PT')} E/mes</p></div>
          <div><p className="text-xs text-stone-600 mb-1">Taxa de esforco</p><p className="font-medium text-sm" style={{ color: 'var(--accent)' }}>{te.toFixed(1)}%</p></div>
        </div>
        <div className="px-4 py-3 rounded-xl" style={{ background: `${verdict.color}18`, border: `1px solid ${verdict.color}30` }}>
          <p className="font-medium text-sm" style={{ color: verdict.color }}>{verdict.text}</p>
        </div>
      </div>
    </div>
  )
}
