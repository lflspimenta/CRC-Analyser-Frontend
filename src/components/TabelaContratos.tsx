'use client'

import type { Contrato } from '@/types'

export default function TabelaContratos({ contratos }: { contratos: Contrato[] }) {
  const totalDivida    = contratos.reduce((s,c) => s + c.total_em_divida, 0)
  const totalPrestacao = contratos.filter(c => c.periodicidade === 'Mensal').reduce((s,c) => s + c.prestacao, 0)
  const totalPotencial = contratos.reduce((s,c) => s + c.potencial, 0)

  return (
    <div className="stagger space-y-4">
      <div>
        <h2 className="text-stone-200 font-medium mb-1">Contratos extraidos</h2>
        <p className="text-sm text-stone-500">{contratos.length} contrato(s)</p>
      </div>
      <div className="space-y-3">
        {contratos.map((c,i) => <ContratoCard key={i} contrato={c} />)}
      </div>
      <div className="rounded-xl p-4 grid grid-cols-3 gap-4 text-center"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div>
          <p className="text-xs text-stone-600 mb-1">Total em divida</p>
          <p className="text-stone-200 font-medium">{totalDivida.toFixed(2)} E</p>
        </div>
        <div>
          <p className="text-xs text-stone-600 mb-1">Prestacao/mes</p>
          <p className="text-stone-200 font-medium">{totalPrestacao.toFixed(2)} E</p>
        </div>
        <div>
          <p className="text-xs text-stone-600 mb-1">Potencial</p>
          <p className="text-stone-200 font-medium">{totalPotencial.toFixed(2)} E</p>
        </div>
      </div>
    </div>
  )
}

function ContratoCard({ contrato: c }: { contrato: Contrato }) {
  const isCartao = c.produto.toLowerCase().includes('cart')
  const semPrazo = c.fim === '9999-12-31'
  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium inline-block mb-1"
            style={{ background: isCartao ? 'rgba(99,102,241,0.15)' : 'rgba(212,168,71,0.15)',
                     color: isCartao ? '#a5b4fc' : 'var(--accent)' }}>
            {isCartao ? 'Cartao' : 'Credito'}
          </span>
          {c.n_devedores > 1 && (
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#a8a29e' }}>
              {c.n_devedores} devedores
            </span>
          )}
          <p className="text-stone-200 font-medium text-sm">{c.produto}</p>
          <p className="text-stone-500 text-xs mt-0.5">{c.instituicao}</p>
        </div>
        <div className="text-right">
          <p className="text-stone-200 font-medium">{c.total_em_divida.toFixed(2)} E</p>
          <p className="text-xs text-stone-600">em divida</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Prestacao" value={c.prestacao > 0 ? `${c.prestacao.toFixed(2)} E/mes` : '-'} />
        <Field label="Potencial"  value={c.potencial > 0 ? `${c.potencial.toFixed(2)} E` : '-'} />
        <Field label="Inicio"     value={c.inicio} />
        <Field label="Fim"        value={semPrazo ? 'Sem prazo' : c.fim} dim={semPrazo} />
      </div>
      {c.em_incumprimento > 0 && (
        <div className="mt-3 px-3 py-2 rounded-lg text-xs text-red-300"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          Incumprimento: {c.em_incumprimento.toFixed(2)} E
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
