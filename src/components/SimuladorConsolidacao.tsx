'use client'

import { useState } from 'react'
import type { AnaliseResult } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-8bfe4.up.railway.app'

interface Props {
  resultado: AnaliseResult
  pdfFile: File | null
}

interface SimResult {
  situacao_actual: { n_creditos_pessoais: number; total_divida_pessoal: number; total_divida_cartoes: number; prestacao_mensal_actual: number; taxa_esforco_actual: number }
  opcao_1_so_pessoais: { descricao: string; nova_prestacao_mensal: number; poupanca_mensal: number; poupanca_total_estimada: number; taxa_esforco_resultante: number }
  opcao_2_pessoais_e_cartoes: { descricao: string; nova_prestacao_mensal: number; poupanca_mensal: number; poupanca_total_estimada: number; taxa_esforco_resultante: number }
  contratos_incluidos: { instituicao: string; produto: string; divida: number; prestacao: number }[]
  cartoes_incluidos: { instituicao: string; produto: string; divida: number }[]
}

export default function SimuladorConsolidacao({ resultado, pdfFile }: Props) {
  const [taxa, setTaxa] = useState(7.5)
  const [prazo, setPrazo] = useState(7)
  const [simResult, setSimResult] = useState<SimResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const simular = async () => {
    if (!pdfFile) { setError('PDF não disponível.'); return }
    setLoading(true); setError('')

    const form = new FormData()
    form.append('pdf', pdfFile)
    form.append('rendimento_mensal', String(resultado.rendimento_mensal))
    form.append('taxa_nova', String(taxa))
    form.append('prazo_anos', String(prazo))

    try {
      const res = await fetch(`${API_URL}/simular-consolidacao`, { method: 'POST', body: form })
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Erro') }
      setSimResult(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const teColor = (te: number) => te <= 35 ? '#22c55e' : te <= 45 ? '#d4a847' : '#ef4444'
  const teLabel = (te: number) => te <= 35 ? 'Aprovação provável' : te <= 45 ? 'Aprovação incerta' : 'Aprovação improvável'

  return (
    <div className="stagger space-y-5">
      <div>
        <h2 className="text-stone-200 font-medium mb-1">Simulador de consolidação</h2>
        <p className="text-sm text-stone-500">
          Calcula quanto pouparias ao juntar todos os créditos pessoais num único contrato.
        </p>
      </div>

      {/* parâmetros */}
      <div className="rounded-xl p-5 space-y-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-xs text-stone-500 uppercase tracking-wider">Condições do novo crédito</p>
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-stone-500">Taxa TAEG</span>
            <span className="text-stone-200 font-medium">{taxa.toFixed(1)}%</span>
          </div>
          <input type="range" min={3} max={20} step={0.5} value={taxa}
            onChange={e => setTaxa(Number(e.target.value))}
            className="w-full cursor-pointer" style={{ accentColor: 'var(--accent)' }}/>
          <div className="flex justify-between text-xs text-stone-700 mt-1">
            <span>3% (melhor cenário)</span><span>20% (pior cenário)</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-stone-500">Prazo</span>
            <span className="text-stone-200 font-medium">{prazo} anos</span>
          </div>
          <input type="range" min={2} max={15} step={1} value={prazo}
            onChange={e => setPrazo(Number(e.target.value))}
            className="w-full cursor-pointer" style={{ accentColor: 'var(--accent)' }}/>
          <div className="flex justify-between text-xs text-stone-700 mt-1">
            <span>2 anos</span><span>15 anos</span>
          </div>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button onClick={simular} disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
          style={{ background: 'var(--accent)', color: '#1c1917' }}>
          {loading ? 'A calcular…' : 'Simular consolidação'}
        </button>
      </div>

      {simResult && (
        <>
          {/* situação actual */}
          <div className="rounded-xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">Situação actual</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Créditos pessoais" value={`${simResult.situacao_actual.n_creditos_pessoais}`} />
              <Field label="Total em dívida" value={`${simResult.situacao_actual.total_divida_pessoal.toLocaleString('pt-PT', {maximumFractionDigits:2})} €`} />
              <Field label="Prestação mensal" value={`${simResult.situacao_actual.prestacao_mensal_actual.toFixed(2)} €`} />
              <Field label="Taxa de esforço" value={`${simResult.situacao_actual.taxa_esforco_actual}%`} color="var(--accent)" />
            </div>
          </div>

          {/* opções */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[simResult.opcao_1_so_pessoais, simResult.opcao_2_pessoais_e_cartoes].map((op, i) => (
              <div key={i} className="rounded-xl p-4"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Opção {i + 1}</p>
                <p className="text-xs text-stone-400 mb-4 leading-snug">{op.descricao}</p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-stone-500">Nova prestação</span>
                    <span className="text-sm font-medium text-stone-200">{op.nova_prestacao_mensal.toFixed(2)} €/mês</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-stone-500">Poupança mensal</span>
                    <span className="text-sm font-medium" style={{ color: op.poupanca_mensal > 0 ? '#22c55e' : '#ef4444' }}>
                      {op.poupanca_mensal > 0 ? '+' : ''}{op.poupanca_mensal.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-stone-500">Poupança estimada total</span>
                    <span className="text-sm font-medium" style={{ color: op.poupanca_total_estimada > 0 ? '#22c55e' : '#ef4444' }}>
                      {op.poupanca_total_estimada > 0 ? '+' : ''}{op.poupanca_total_estimada.toLocaleString('pt-PT', {maximumFractionDigits:0})} €
                    </span>
                  </div>
                  <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-stone-500">Nova taxa de esforço</span>
                      <span className="text-sm font-medium" style={{ color: teColor(op.taxa_esforco_resultante) }}>
                        {op.taxa_esforco_resultante}%
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: teColor(op.taxa_esforco_resultante) }}>
                      {teLabel(op.taxa_esforco_resultante)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* contratos incluídos */}
          {simResult.contratos_incluidos.length > 0 && (
            <div className="rounded-xl p-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">
                Créditos pessoais incluídos na simulação
              </p>
              <div className="space-y-2">
                {simResult.contratos_incluidos.map((c, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-stone-400 truncate flex-1">{c.instituicao}</span>
                    <span className="text-stone-300 ml-4">{c.divida.toLocaleString('pt-PT', {maximumFractionDigits:2})} €</span>
                    <span className="text-stone-600 ml-3 w-20 text-right">{c.prestacao.toFixed(2)} €/mês</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Field({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-xs text-stone-600 mb-1">{label}</p>
      <p className="text-sm font-medium" style={{ color: color || 'var(--color-stone-200)' }}>{value}</p>
    </div>
  )
}
