'use client'

import { useState } from 'react'
import type { AnaliseResult } from '@/types'
import ScoreRing from './ScoreRing'
import MetricCard from './MetricCard'
import AlertaBadge from './AlertaBadge'
import TabelaContratos from './TabelaContratos'
import Recomendacoes from './Recomendacoes'
import Simulador from './Simulador'

interface Props {
  resultado: AnaliseResult
  onReset: () => void
}

const TABS = ['Dashboard', 'Créditos', 'Soluções', 'Simulador']

export default function Dashboard({ resultado, onReset }: Props) {
  const [tab, setTab] = useState(0)
  const { metricas, alertas, contratos, recomendacoes } = resultado

  const scoreColor =
    metricas.score_saude >= 75 ? '#22c55e' :
    metricas.score_saude >= 50 ? '#d4a847' : '#ef4444'

  const scoreLabel =
    metricas.score_saude >= 75 ? 'Situação saudável' :
    metricas.score_saude >= 50 ? 'Situação moderada' : 'Situação de risco'

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent)' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 12V4l6-2 6 2v8l-6 2-6-2Z" stroke="#1c1917" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M8 2v12M2 8h12" stroke="#1c1917" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wider">CRC Analyser</p>
            <p className="text-stone-200 text-sm font-medium leading-none">
              {resultado.titular.split(' ').slice(0, 2).join(' ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-600 hidden sm:block">
            Ref. {resultado.referente_a}
          </span>
          <button
            onClick={onReset}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:text-stone-200"
            style={{ borderColor: 'var(--border)', color: 'var(--color-stone-500)' }}
          >
            Novo CRC
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex border-b px-6" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-3 text-sm transition-colors border-b-2 -mb-px ${
              tab === i
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-300'
            }`}
          >
            {t}
            {t === 'Soluções' && recomendacoes.length > 0 && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(212,168,71,0.2)', color: 'var(--accent)' }}>
                {recomendacoes.length}
              </span>
            )}
            {t === 'Dashboard' && alertas.some(a => a.nivel === 'crit') && (
              <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-red-500 mb-0.5" />
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6 max-w-4xl mx-auto w-full">

        {/* ── DASHBOARD ── */}
        {tab === 0 && (
          <div className="stagger space-y-6">

            {/* Score + alertas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Score */}
              <div className="sm:col-span-1 rounded-2xl p-6 flex flex-col items-center justify-center gap-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <ScoreRing score={metricas.score_saude} color={scoreColor} />
                <div className="text-center">
                  <p className="text-sm font-medium text-stone-200">{scoreLabel}</p>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {metricas.n_contratos} contrato(s) · {metricas.n_instituicoes} instituição(ões)
                  </p>
                </div>
              </div>

              {/* Alertas */}
              <div className="sm:col-span-2 rounded-2xl p-5 space-y-2.5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">Alertas</p>
                {alertas.length === 0 ? (
                  <p className="text-sm text-stone-500">Nenhum alerta detectado.</p>
                ) : (
                  alertas.map((a, i) => <AlertaBadge key={i} alerta={a} />)
                )}
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard
                label="Taxa de esforço"
                value={`${metricas.taxa_esforco_pct.toFixed(1)}%`}
                status={metricas.taxa_esforco_pct > 50 ? 'crit' : metricas.taxa_esforco_pct > 35 ? 'warn' : 'ok'}
                bar={{ value: metricas.taxa_esforco_pct, max: 80 }}
                hint="Limite: 35%"
              />
              <MetricCard
                label="Rácio dívida / rend."
                value={`${metricas.racio_divida_rendimento.toFixed(1)}×`}
                status={metricas.racio_divida_rendimento > 3 ? 'warn' : 'ok'}
                bar={{ value: metricas.racio_divida_rendimento, max: 6 }}
                hint="Alerta acima de 3×"
              />
              <MetricCard
                label="Prestação mensal"
                value={`${metricas.prestacao_mensal.toLocaleString('pt-PT', { maximumFractionDigits: 0 })} €`}
                status="neutral"
                hint={`Rend: ${resultado.rendimento_mensal.toLocaleString('pt-PT')} €`}
              />
              <MetricCard
                label="Incumprimento"
                value={metricas.incumprimento_total === 0 ? 'Nenhum' : `${metricas.incumprimento_total.toLocaleString('pt-PT')} €`}
                status={metricas.incumprimento_total > 0 ? 'crit' : 'ok'}
                hint={metricas.incumprimento_total === 0 ? 'Historial limpo' : 'Crítico'}
              />
            </div>

            {/* Resumo dívida */}
            <div className="rounded-2xl p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-4">Endividamento</p>
              <div className="flex flex-col gap-3">
                <DebtBar
                  label="Efectivo"
                  value={metricas.divida_efetiva}
                  total={metricas.endividamento_total}
                  color="var(--accent)"
                />
                <DebtBar
                  label="Potencial (limites cartões)"
                  value={metricas.divida_potencial}
                  total={metricas.endividamento_total}
                  color="rgba(212,168,71,0.35)"
                />
              </div>
              <p className="text-right text-xs text-stone-500 mt-3">
                Total: <span className="text-stone-200 font-medium">
                  {metricas.endividamento_total.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} €
                </span>
              </p>
            </div>

          </div>
        )}

        {/* ── CRÉDITOS ── */}
        {tab === 1 && <TabelaContratos contratos={contratos} />}

        {/* ── SOLUÇÕES ── */}
        {tab === 2 && <Recomendacoes recomendacoes={recomendacoes} />}

        {/* ── SIMULADOR ── */}
        {tab === 3 && (
          <Simulador
            prestacaoActual={metricas.prestacao_mensal}
            rendimento={resultado.rendimento_mensal}
          />
        )}
      </main>
    </div>
  )
}

function DebtBar({ label, value, total, color }: {
  label: string; value: number; total: number; color: string
}) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div>
      <div className="flex justify-between text-xs text-stone-500 mb-1.5">
        <span>{label}</span>
        <span className="text-stone-300">
          {value.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} €
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}
