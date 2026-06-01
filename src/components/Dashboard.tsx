'use client'

import { useState } from 'react'
import type { AnaliseResult } from '@/types'
import { ScoreRing, MetricCard, AlertaBadge } from './ScoreRing'
import TabelaContratos from './TabelaContratos'
import { Recomendacoes, Simulador } from './Recomendacoes'
import AnaliseIA from './AnaliseIA'
import SimuladorConsolidacao from './SimuladorConsolidacao'

interface Props { resultado: AnaliseResult; onReset: () => void; pdfFile: File | null }

const TABS = ['Dashboard', 'Creditos', 'Solucoes', 'Analise IA', 'Consolidacao', 'Simulador']

export default function Dashboard({ resultado, onReset, pdfFile }: Props) {
  const [tab, setTab] = useState(0)
  const { metricas, alertas, contratos, recomendacoes } = resultado

  const scoreColor =
    metricas.score_saude >= 75 ? '#22c55e' :
    metricas.score_saude >= 50 ? '#d4a847' : '#ef4444'

  const scoreLabel =
    metricas.score_saude >= 75 ? 'Situacao saudavel' :
    metricas.score_saude >= 50 ? 'Situacao moderada' : 'Situacao de risco'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 12V4l6-2 6 2v8l-6 2-6-2Z" stroke="#1c1917" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M8 2v12M2 8h12" stroke="#1c1917" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wider">CRC Analyser</p>
            <p className="text-stone-200 text-sm font-medium">{resultado.titular.split(' ').slice(0,2).join(' ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-600 hidden sm:block">Ref. {resultado.referente_a}</span>
          <button onClick={onReset} className="text-xs px-3 py-1.5 rounded-lg border transition-colors text-stone-400 hover:text-stone-200"
            style={{ borderColor: 'var(--border)' }}>Novo CRC</button>
        </div>
      </header>

      <nav className="flex border-b px-4 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-3 py-3 text-sm transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0 ${
              tab === i ? 'border-amber-400 text-amber-400' : 'border-transparent text-stone-500 hover:text-stone-300'
            }`}>
            {t}
            {t === 'Solucoes' && recomendacoes.length > 0 && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(212,168,71,0.2)', color: 'var(--accent)' }}>{recomendacoes.length}</span>
            )}
            {t === 'Analise IA' && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(212,168,71,0.2)', color: 'var(--accent)' }}>Novo</span>
            )}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto px-6 py-6 max-w-4xl mx-auto w-full">
        {tab === 0 && (
          <div className="stagger space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1 rounded-2xl p-6 flex flex-col items-center justify-center gap-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <ScoreRing score={metricas.score_saude} color={scoreColor}/>
                <div className="text-center">
                  <p className="text-sm font-medium text-stone-200">{scoreLabel}</p>
                  <p className="text-xs text-stone-600 mt-0.5">{metricas.n_contratos} contratos - {metricas.n_instituicoes} instituicoes</p>
                </div>
              </div>
              <div className="sm:col-span-2 rounded-2xl p-5 space-y-2.5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">Alertas</p>
                {alertas.length === 0
                  ? <p className="text-sm text-stone-500">Nenhum alerta.</p>
                  : alertas.map((a, i) => <AlertaBadge key={i} alerta={a}/>)}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard label="Taxa de esforco" value={`${metricas.taxa_esforco_pct.toFixed(1)}%`}
                status={metricas.taxa_esforco_pct > 50 ? 'crit' : metricas.taxa_esforco_pct > 35 ? 'warn' : 'ok'}
                bar={{ value: metricas.taxa_esforco_pct, max: 80 }} hint="Limite: 35%"/>
              <MetricCard label="Racio divida/rend." value={`${metricas.racio_divida_rendimento.toFixed(1)}x`}
                status={metricas.racio_divida_rendimento > 3 ? 'warn' : 'ok'}
                bar={{ value: metricas.racio_divida_rendimento, max: 6 }} hint="Alerta acima de 3x"/>
              <MetricCard label="Prestacao mensal" value={`${metricas.prestacao_mensal.toFixed(0)} E`}
                status="neutral" hint={`Rend: ${resultado.rendimento_mensal} E`}/>
              <MetricCard label="Incumprimento"
                value={metricas.incumprimento_total === 0 ? 'Nenhum' : `${metricas.incumprimento_total.toFixed(0)} E`}
                status={metricas.incumprimento_total > 0 ? 'crit' : 'ok'}
                hint={metricas.incumprimento_total === 0 ? 'Historial limpo' : 'Critico'}/>
            </div>
            <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-4">Endividamento</p>
              {[
                { label: 'Efectivo', value: metricas.divida_efetiva, color: 'var(--accent)' },
                { label: 'Potencial (cartoes)', value: metricas.divida_potencial, color: 'rgba(212,168,71,0.35)' },
              ].map(b => (
                <div key={b.label} className="mb-3">
                  <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                    <span>{b.label}</span><span className="text-stone-300">{b.value.toFixed(2)} E</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full bar-fill"
                      style={{ width: `${metricas.endividamento_total > 0 ? (b.value/metricas.endividamento_total)*100 : 0}%`, background: b.color }}/>
                  </div>
                </div>
              ))}
              <p className="text-right text-xs text-stone-500 mt-2">
                Total: <span className="text-stone-200 font-medium">{metricas.endividamento_total.toFixed(2)} E</span>
              </p>
            </div>

            {/* botão rápido para análise IA */}
            <button onClick={() => setTab(3)}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{ background: 'rgba(212,168,71,0.1)', border: '1px solid rgba(212,168,71,0.3)', color: 'var(--accent)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2Z" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Ver análise detalhada por IA
            </button>
          </div>
        )}
        {tab === 1 && <TabelaContratos contratos={contratos}/>}
        {tab === 2 && <Recomendacoes recomendacoes={recomendacoes}/>}
        {tab === 3 && <AnaliseIA resultado={resultado} pdfFile={pdfFile}/>}
        {tab === 4 && <SimuladorConsolidacao resultado={resultado} pdfFile={pdfFile}/>}
        {tab === 5 && <Simulador prestacaoActual={metricas.prestacao_mensal} rendimento={resultado.rendimento_mensal}/>}
      </main>
    </div>
  )
}
