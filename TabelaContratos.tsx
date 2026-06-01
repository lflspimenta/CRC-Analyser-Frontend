'use client'

import type { Contrato } from '@/types'

export default function TabelaContratos({ contratos }: { contratos: Contrato[] }) {
  const totalDivida = contratos.reduce((s, c) => s + c.total_em_divida, 0)
  const totalPrestacao = contratos.filter(c => c.periodicidade === 'Mensal').reduce((s, c) => s + c.prestacao, 0)
  const totalPotencial = contratos.reduce((s, c) => s + c.potencial, 0)

  return (
    <div className="stagger space-y-4">
      <div>
        <h2 className="text-stone-200 font-medium mb-1">Contratos extraídos</h2>
        <p className="text-sm text-stone-500">
          {contratos.length} contrato(s) · {new Set(contratos.map(c => c.instituicao)).size} instituição(ões)
        </p>
      </div>

      <div className="space-y-3">
        {contratos.map((c, i) => (
          <ContratoCard key={i} contrato={c} />
        ))}
      </div>

      {/* Totais */}
      <div className="rounded-xl p-4 grid grid-cols-3 gap-4 text-center"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div>
          <p className="text-xs text-stone-600 mb-1">Total em dívida</p>
          <p className="text-stone-200 font-medium">
            {totalDivida.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} €
          </p>
        </div>
        <div>
          <p className="text-xs text-stone-600 mb-1">Prestação/mês</p>
          <p className="text-stone-200 font-medium">
            {totalPrestacao.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} €
          </p>
        </div>
        <div>
          <p className="text-xs text-stone-600 mb-1">Potencial</p>
          <p className="text-stone-200 font-medium">
            {totalPotencial.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} €
          </p>
        </div>
      </div>
    </div>
  )
}

function ContratoCard({ contrato: c }: { contrato: Contrato }) {
  const isCartao = c.produto.toLowerCase().includes('cartão')
  const semPrazo = c.fim === '9999-12-31'
  const incumprimento = c.em_incumprimento > 0

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: isCartao ? 'rgba(99,102,241,0.15)' : 'rgba(212,168,71,0.15)',
                color: isCartao ? '#a5b4fc' : 'var(--accent)',
              }}>
              {isCartao ? 'Cartão' : 'Crédito'}
            </span>
            {c.n_devedores > 1 && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#a8a29e' }}>
                {c.n_devedores} devedores
              </span>
            )}
            {c.em_litigio && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>
                Em litígio
              </span>
            )}
          </div>
          <p className="text-stone-200 font-medium text-sm">{c.produto}</p>
          <p className="text-stone-500 text-xs mt-0.5">{c.instituicao}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-stone-200 font-medium">
            {c.total_em_divida.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} €
          </p>
          <p className="text-xs text-stone-600">em dívida</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Prestação" value={c.prestacao > 0 ? `${c.prestacao.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} €/mês` : '—'} />
        <Field label="Potencial" value={c.potencial > 0 ? `${c.potencial.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} €` : '—'} />
        <Field label="Início" value={c.inicio} />
        <Field label="Fim" value={semPrazo ? 'Sem prazo' : c.fim} dim={semPrazo} />
      </div>

      {incumprimento && (
        <div className="mt-3 px-3 py-2 rounded-lg text-xs text-red-300"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          ⚠️ Em incumprimento: {c.em_incumprimento.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} €
        </div>
      )}
    </div>
  )
}

function Field({ label, value, dim }: { label: string; value: string; dim?: boolean }) {
  return (
    <div>
      <p className="text-xs text-stone-600 mb-0.5">{label}</p>
      <p className={`text-sm ${dim ? 'text-stone-600' : 'text-stone-300'}`}>{value}</p>
    </div>
  )
}
