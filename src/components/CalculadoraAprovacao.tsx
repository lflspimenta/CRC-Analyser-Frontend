'use client'

import { useState } from 'react'
import type { AnaliseResult } from '@/types'

interface Props {
  resultado: AnaliseResult
}

interface BancoResult {
  banco: string
  logo: string
  probabilidade: 'alta' | 'media' | 'baixa' | 'improvavel'
  te_maximo: number
  te_atual: number
  te_novo: number
  razoes_aprovacao: string[]
  razoes_recusa: string[]
  montante_maximo_estimado: number
}

const BANCOS = [
  { nome: 'Caixa Geral de Depositos', sigla: 'CGD', te_max: 35, ltv_max: 90, idade_max: 75, cor: '#1a6b3c' },
  { nome: 'Millennium BCP',           sigla: 'BCP', te_max: 40, ltv_max: 90, idade_max: 75, cor: '#cc0000' },
  { nome: 'Santander',                sigla: 'STD', te_max: 35, ltv_max: 90, idade_max: 70, cor: '#ec0000' },
  { nome: 'BPI',                      sigla: 'BPI', te_max: 36, ltv_max: 90, idade_max: 75, cor: '#003399' },
  { nome: 'Novo Banco',               sigla: 'NB',  te_max: 35, ltv_max: 85, idade_max: 75, cor: '#f7a800' },
]

function calcularPMT(capital: number, taxaAnual: number, prazoAnos: number): number {
  const r = taxaAnual / 100 / 12
  const n = prazoAnos * 12
  if (r === 0) return capital / n
  return (capital * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

function calcularMontanteMaximo(
  teMax: number,
  rendimento: number,
  prestacaoActual: number,
  taxaHabitacao: number,
  prazo: number
): number {
  const prestacaoMaxima = (teMax / 100) * rendimento - prestacaoActual
  if (prestacaoMaxima <= 0) return 0
  const r = taxaHabitacao / 100 / 12
  const n = prazo * 12
  if (r === 0) return prestacaoMaxima * n
  return prestacaoMaxima * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n))
}

export default function CalculadoraAprovacao({ resultado }: Props) {
  const [valorImovel, setValorImovel] = useState(150000)
  const [entrada, setEntrada] = useState(15000)
  const [idade, setIdade] = useState(35)
  const [prazo, setPrazo] = useState(30)
  const [taxaRef, setTaxaRef] = useState(3.5)
  const [calculado, setCalculado] = useState(false)
  const [resultados, setResultados] = useState<BancoResult[]>([])

  const { metricas, contratos } = resultado
  const capitalPedido = valorImovel - entrada
  const ltvPct = (capitalPedido / valorImovel) * 100

  const temIncumprimento = metricas.incumprimento_total > 0
  const temRenegociacao = contratos.some(c => c.tipo_negociacao?.includes('Renegociação'))
  const nRenegociacoes = contratos.filter(c => c.tipo_negociacao?.includes('Renegociação')).length
  const temAvalista = contratos.some(c =>
    c.tipo_responsabilidade?.toLowerCase().includes('avalista') ||
    c.tipo_responsabilidade?.toLowerCase().includes('fiador')
  )
  const idadeFimContrato = idade + prazo

  const calcular = () => {
    const novosResultados: BancoResult[] = BANCOS.map(banco => {
      const prestacaoNova = calcularPMT(capitalPedido, taxaRef, prazo)
      const teNovo = ((metricas.prestacao_mensal + prestacaoNova) / resultado.rendimento_mensal) * 100
      const montanteMax = calcularMontanteMaximo(
        banco.te_max, resultado.rendimento_mensal, metricas.prestacao_mensal, taxaRef, prazo
      )

      const razoes_aprovacao: string[] = []
      const razoes_recusa: string[] = []
      let score = 100

      // taxa de esforço
      if (teNovo <= banco.te_max * 0.8) {
        razoes_aprovacao.push(`Taxa de esforço confortável (${teNovo.toFixed(1)}% vs máx ${banco.te_max}%)`)
      } else if (teNovo <= banco.te_max) {
        razoes_aprovacao.push(`Taxa de esforço dentro do limite (${teNovo.toFixed(1)}% vs máx ${banco.te_max}%)`)
        score -= 15
      } else {
        razoes_recusa.push(`Taxa de esforço excede o máximo (${teNovo.toFixed(1)}% > ${banco.te_max}%)`)
        score -= 50
      }

      // LTV
      if (ltvPct <= banco.ltv_max * 0.8) {
        razoes_aprovacao.push(`Entrada robusta — LTV de ${ltvPct.toFixed(0)}% (máx ${banco.ltv_max}%)`)
      } else if (ltvPct <= banco.ltv_max) {
        razoes_aprovacao.push(`LTV aceitável: ${ltvPct.toFixed(0)}% (máx ${banco.ltv_max}%)`)
        score -= 10
      } else {
        razoes_recusa.push(`Entrada insuficiente — LTV de ${ltvPct.toFixed(0)}% excede ${banco.ltv_max}%`)
        score -= 40
      }

      // idade no fim do contrato
      if (idadeFimContrato <= banco.idade_max - 5) {
        razoes_aprovacao.push(`Idade no fim do contrato adequada (${idadeFimContrato} anos)`)
      } else if (idadeFimContrato <= banco.idade_max) {
        razoes_aprovacao.push(`Idade no fim do contrato dentro do limite (${idadeFimContrato} anos)`)
        score -= 10
      } else {
        razoes_recusa.push(`Idade no fim do contrato excede o limite (${idadeFimContrato} > ${banco.idade_max} anos)`)
        score -= 35
      }

      // incumprimento
      if (temIncumprimento) {
        razoes_recusa.push('Incumprimentos activos detectados no CRC — bloqueio automático')
        score -= 80
      } else {
        razoes_aprovacao.push('Sem incumprimentos no historial de crédito')
      }

      // renegociações
      if (nRenegociacoes >= 3) {
        razoes_recusa.push(`${nRenegociacoes} créditos com renegociação por incumprimento — risco elevado`)
        score -= 30
      } else if (nRenegociacoes > 0) {
        razoes_recusa.push(`${nRenegociacoes} crédito(s) com renegociação — pode dificultar aprovação`)
        score -= 15
      } else {
        razoes_aprovacao.push('Sem renegociações por incumprimento no historial')
      }

      // avalista
      if (temAvalista) {
        razoes_recusa.push('És avalista em contrato activo — responsabilidade solidária conta para a TE')
        score -= 10
      }

      // rácio dívida
      if (metricas.racio_divida_rendimento > 3) {
        razoes_recusa.push(`Rácio dívida/rendimento elevado (${metricas.racio_divida_rendimento.toFixed(1)}×)`)
        score -= 15
      } else {
        razoes_aprovacao.push(`Rácio dívida/rendimento saudável (${metricas.racio_divida_rendimento.toFixed(1)}×)`)
      }

      // probabilidade
      let probabilidade: BancoResult['probabilidade']
      if (score >= 80) probabilidade = 'alta'
      else if (score >= 55) probabilidade = 'media'
      else if (score >= 30) probabilidade = 'baixa'
      else probabilidade = 'improvavel'

      return {
        banco: banco.nome,
        logo: banco.sigla,
        probabilidade,
        te_maximo: banco.te_max,
        te_atual: metricas.taxa_esforco_pct,
        te_novo: Math.round(teNovo * 10) / 10,
        razoes_aprovacao,
        razoes_recusa,
        montante_maximo_estimado: Math.round(montanteMax),
        cor: banco.cor,
      } as BancoResult & { cor: string }
    })

    setResultados(novosResultados)
    setCalculado(true)
  }

  const probConfig = {
    alta:       { label: 'Aprovação provável',    bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)',  text: '#22c55e' },
    media:      { label: 'Aprovação incerta',      bg: 'rgba(212,168,71,0.12)', border: 'rgba(212,168,71,0.25)', text: '#d4a847' },
    baixa:      { label: 'Aprovação difícil',      bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   text: '#ef4444' },
    improvavel: { label: 'Aprovação improvável',   bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.3)',   text: '#f87171' },
  }

  return (
    <div className="stagger space-y-5">
      <div>
        <h2 className="text-stone-200 font-medium mb-1">Calculadora de pré-aprovação</h2>
        <p className="text-sm text-stone-500">
          Estimativa da probabilidade de aprovação nos principais bancos portugueses,
          com base nos dados reais do teu CRC.
        </p>
      </div>

      {/* aviso metodologia */}
      <div className="px-4 py-3 rounded-xl text-xs text-stone-500 leading-relaxed"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
        Baseado nas regras prudenciais públicas de cada banco. Não substitui uma análise real —
        cada banco tem critérios internos adicionais. Usa como orientação, não como garantia.
      </div>

      {/* parâmetros */}
      <div className="rounded-xl p-5 space-y-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-xs text-stone-500 uppercase tracking-wider">Dados do crédito habitação</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SliderField
            label="Valor do imóvel"
            min={50000} max={600000} step={5000}
            value={valorImovel}
            display={`${valorImovel.toLocaleString('pt-PT')} €`}
            onChange={setValorImovel}
          />
          <SliderField
            label="Entrada (capital próprio)"
            min={5000} max={Math.min(valorImovel * 0.5, 200000)} step={5000}
            value={Math.min(entrada, valorImovel * 0.5)}
            display={`${Math.min(entrada, valorImovel * 0.5).toLocaleString('pt-PT')} € (${((Math.min(entrada, valorImovel * 0.5)/valorImovel)*100).toFixed(0)}%)`}
            onChange={v => setEntrada(Math.min(v, valorImovel * 0.5))}
          />
          <SliderField
            label="Prazo"
            min={10} max={40} step={1}
            value={prazo}
            display={`${prazo} anos`}
            onChange={setPrazo}
          />
          <SliderField
            label="Taxa TAEG estimada"
            min={1} max={8} step={0.1}
            value={taxaRef}
            display={`${taxaRef.toFixed(1)}%`}
            onChange={v => setTaxaRef(Math.round(v * 10) / 10)}
          />
          <SliderField
            label="A tua idade actual"
            min={18} max={65} step={1}
            value={idade}
            display={`${idade} anos (${idade + prazo} no fim)`}
            onChange={setIdade}
          />
        </div>

        {/* resumo do pedido */}
        <div className="grid grid-cols-3 gap-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <MiniStat label="Capital pedido" value={`${capitalPedido.toLocaleString('pt-PT')} €`} />
          <MiniStat label="LTV" value={`${ltvPct.toFixed(0)}%`} warn={ltvPct > 80} />
          <MiniStat label="Prestação estimada" value={`${Math.round(calcularPMT(capitalPedido, taxaRef, prazo))} €/mês`} />
        </div>

        <button onClick={calcular}
          className="w-full py-3 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'var(--accent)', color: '#1c1917' }}>
          Calcular probabilidade de aprovação
        </button>
      </div>

      {/* resultados */}
      {calculado && (
        <div className="space-y-4">
          <p className="text-xs text-stone-500 uppercase tracking-wider">
            Resultado para crédito de {capitalPedido.toLocaleString('pt-PT')} € a {prazo} anos
          </p>

          {resultados.map((r: any) => {
            const cfg = probConfig[r.probabilidade]
            return (
              <div key={r.banco} className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${cfg.border}` }}>
                {/* cabeçalho banco */}
                <div className="flex items-center justify-between px-5 py-3"
                  style={{ background: cfg.bg }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: r.cor }}>
                      {r.logo}
                    </div>
                    <div>
                      <p className="text-stone-200 font-medium text-sm">{r.banco}</p>
                      <p className="text-xs" style={{ color: cfg.text }}>{cfg.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-500 mb-0.5">Nova taxa esforço</p>
                    <p className="font-medium text-sm" style={{ color: r.te_novo > r.te_maximo ? '#ef4444' : '#22c55e' }}>
                      {r.te_novo}% <span className="text-stone-600 font-normal">/ {r.te_maximo}%</span>
                    </p>
                  </div>
                </div>

                {/* detalhes */}
                <div className="px-5 py-4 space-y-3" style={{ background: 'var(--surface)' }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {r.razoes_aprovacao.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-2">A favor</p>
                        {r.razoes_aprovacao.map((razao: string, i: number) => (
                          <div key={i} className="flex gap-2 text-xs text-stone-400 mb-1.5">
                            <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                            <span>{razao}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {r.razoes_recusa.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-2">Contra</p>
                        {r.razoes_recusa.map((razao: string, i: number) => (
                          <div key={i} className="flex gap-2 text-xs text-stone-400 mb-1.5">
                            <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>
                            <span>{razao}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {r.montante_maximo_estimado > 0 && (
                    <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                      <p className="text-xs text-stone-500">
                        Montante máximo estimado neste banco:{' '}
                        <span className="text-stone-200 font-medium">
                          {r.montante_maximo_estimado.toLocaleString('pt-PT')} €
                        </span>
                        {r.montante_maximo_estimado < capitalPedido && (
                          <span className="text-amber-500 ml-2">
                            (precisas reduzir o pedido em {(capitalPedido - r.montante_maximo_estimado).toLocaleString('pt-PT')} €)
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SliderField({ label, min, max, step, value, display, onChange }: {
  label: string; min: number; max: number; step: number
  value: number; display: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-2">
        <span className="text-stone-500">{label}</span>
        <span className="text-stone-200 font-medium">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full cursor-pointer" style={{ accentColor: 'var(--accent)' }}/>
    </div>
  )
}

function MiniStat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <p className="text-xs text-stone-600 mb-1">{label}</p>
      <p className="text-sm font-medium" style={{ color: warn ? '#d4a847' : 'var(--color-stone-200)' }}>{value}</p>
    </div>
  )
}
