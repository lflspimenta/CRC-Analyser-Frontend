"""
setup_frontend.py
Corre este script dentro da pasta CRC-Analyser-Frontend no Git Bash:
  python setup_frontend.py
Ou no Windows Explorer: duplo clique no ficheiro
"""
import os

os.makedirs('src/app', exist_ok=True)
os.makedirs('src/components', exist_ok=True)

files = {}

# ── raiz ──────────────────────────────────────────────────────────────────────

files['next.config.js'] = """/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig
"""

files['postcss.config.js'] = """module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
"""

files['tailwind.config.js'] = """/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
    },
  },
  plugins: [],
}
"""

files['tsconfig.json'] = """{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "paths": {"@/*": ["./src/*"]}
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
"""

files['package.json'] = """{
  "name": "crc-analyser-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "15.3.3",
    "react": "^19",
    "react-dom": "^19"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10",
    "postcss": "^8",
    "tailwindcss": "^3",
    "typescript": "^5"
  }
}
"""

files['.gitignore'] = """node_modules/
.next/
.env.local
*.pdf
out/
"""

# ── src/types.ts ──────────────────────────────────────────────────────────────

files['src/types.ts'] = """export interface Contrato {
  instituicao: string; codigo_instituicao: string; produto: string
  tipo_responsabilidade: string; tipo_negociacao: string
  inicio: string; fim: string; fim_efetivo: string | null
  em_litigio: boolean; n_devedores: number
  total_em_divida: number; em_incumprimento: number
  vencido: number; abatido_ao_ativo: number
  potencial: number; prestacao: number
  periodicidade: string; tem_garantias: boolean
}
export interface Metrica {
  divida_efetiva: number; divida_potencial: number; endividamento_total: number
  prestacao_mensal: number; incumprimento_total: number; vencido_total: number
  abatido_total: number; n_contratos: number; n_instituicoes: number
  taxa_esforco_pct: number; racio_divida_rendimento: number; score_saude: number
}
export interface Alerta { nivel: 'info'|'warn'|'crit'; codigo: string; msg: string }
export interface Recomendacao {
  prioridade: number; impacto: string; titulo: string
  descricao: string; codigo: string; valor_estimado?: number; instituicoes?: string[]
}
export interface AnaliseResult {
  titular: string; referente_a: string; data_emissao: string
  rendimento_mensal: number; metricas: Metrica
  alertas: Alerta[]; recomendacoes: Recomendacao[]; contratos: Contrato[]
}
"""

# ── src/app/globals.css ───────────────────────────────────────────────────────

files['src/app/globals.css'] = """@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --accent: #d4a847;
  --accent-dim: #b8903a;
  --surface: rgba(255,255,255,0.04);
  --border: rgba(255,255,255,0.08);
  --border-hover: rgba(255,255,255,0.16);
}
.upload-zone { border: 1.5px dashed var(--border-hover); transition: border-color 0.2s, background 0.2s; }
.upload-zone:hover, .upload-zone.drag-over { border-color: var(--accent); background: rgba(212,168,71,0.04); }
.stagger > * { opacity: 0; animation: fadeUp 0.4s ease forwards; }
.stagger > *:nth-child(1) { animation-delay: 0.05s; }
.stagger > *:nth-child(2) { animation-delay: 0.10s; }
.stagger > *:nth-child(3) { animation-delay: 0.15s; }
.stagger > *:nth-child(4) { animation-delay: 0.20s; }
.stagger > *:nth-child(5) { animation-delay: 0.25s; }
.stagger > *:nth-child(6) { animation-delay: 0.30s; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.bar-fill { transition: width 1s cubic-bezier(0.4,0,0.2,1); }
"""

# ── src/app/layout.tsx ────────────────────────────────────────────────────────

files['src/app/layout.tsx'] = """import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const display = DM_Serif_Display({ weight: '400', subsets: ['latin'], variable: '--font-display' })
const body = DM_Sans({ subsets: ['latin'], variable: '--font-body' })

export const metadata: Metadata = {
  title: 'CRC Analyser',
  description: 'Analise do Mapa de Responsabilidades de Credito do Banco de Portugal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${display.variable} ${body.variable}`}>
      <body className="bg-stone-950 text-stone-100 font-body antialiased">{children}</body>
    </html>
  )
}
"""

# ── src/app/page.tsx ──────────────────────────────────────────────────────────

files['src/app/page.tsx'] = """'use client'

import { useState, useRef, useCallback } from 'react'
import type { AnaliseResult } from '@/types'
import Dashboard from '@/components/Dashboard'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-8bfe4.up.railway.app'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [rendimento, setRendimento] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState<AnaliseResult | null>(null)
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) { setError('Por favor carrega um ficheiro PDF.'); return }
    setFile(f); setError('')
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const analisar = async () => {
    if (!file) { setError('Selecciona o PDF do CRC.'); return }
    if (!rendimento || Number(rendimento) <= 0) { setError('Introduz o rendimento liquido mensal.'); return }
    setLoading(true); setError('')
    const form = new FormData()
    form.append('pdf', file)
    form.append('rendimento_mensal', rendimento)
    try {
      const res = await fetch(`${API_URL}/analisar`, { method: 'POST', body: form })
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Erro ao processar.') }
      setResultado(await res.json())
    } catch (e: any) {
      setError(e.message || 'Erro de ligacao.')
    } finally {
      setLoading(false)
    }
  }

  if (resultado) return <Dashboard resultado={resultado} onReset={() => setResultado(null)} />

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg stagger">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 12V4l6-2 6 2v8l-6 2-6-2Z" stroke="#1c1917" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 2v12M2 8h12" stroke="#1c1917" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="text-sm font-medium tracking-widest uppercase text-stone-400">CRC Analyser</span>
          </div>
          <h1 className="text-4xl text-stone-50 leading-tight mb-3 font-display">
            Entende a tua<br />situacao de credito
          </h1>
          <p className="text-stone-400 text-sm leading-relaxed">
            Carrega o teu Mapa de Responsabilidades de Credito<br />e obtem uma analise financeira em segundos.
          </p>
        </div>

        <div
          className={`upload-zone rounded-2xl p-8 text-center cursor-pointer mb-4 ${drag ? 'drag-over' : ''}`}
          style={{ background: 'var(--surface)' }}
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
        >
          <input ref={inputRef} type="file" accept=".pdf" className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,168,71,0.15)' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4a2 2 0 0 1 2-2h5l5 5v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z" stroke="#d4a847" strokeWidth="1.5"/>
                  <path d="M11 2v5h5" stroke="#d4a847" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="text-stone-200 text-sm font-medium">{file.name}</p>
                <p className="text-stone-500 text-xs">{(file.size/1024).toFixed(0)} KB</p>
              </div>
              <button onClick={e => { e.stopPropagation(); setFile(null) }} className="ml-auto text-stone-600 hover:text-stone-400">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16V8M9 11l3-3 3 3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 16.5A4 4 0 0 0 16 12H15a7 7 0 1 0-6.5 9.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-stone-300 text-sm mb-1">Arrasta o PDF aqui ou clica para seleccionar</p>
              <p className="text-stone-600 text-xs">Mapa de Responsabilidades de Credito - Banco de Portugal</p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-stone-600 mb-6">
          Nao tens o PDF?{' '}
          <a href="https://clientebancario.bportugal.pt" target="_blank" rel="noopener noreferrer"
            className="underline underline-offset-2" style={{ color: 'var(--accent)' }}>
            Obtem gratuitamente em clientebancario.bportugal.pt
          </a>
        </p>

        <div className="mb-4">
          <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Rendimento liquido mensal (euros)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 text-sm">E</span>
            <input type="number" min="0" step="100" placeholder="ex: 1500" value={rendimento}
              onChange={e => setRendimento(e.target.value)}
              className="w-full pl-8 pr-4 py-3.5 rounded-xl text-sm text-stone-100 placeholder-stone-700 outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}/>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-300"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <button onClick={analisar} disabled={loading}
          className="w-full py-4 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 disabled:opacity-50"
          style={{ background: 'var(--accent)', color: '#1c1917' }}>
          {loading ? 'A analisar...' : 'Analisar CRC'}
        </button>

        <p className="text-center text-xs text-stone-700 mt-5">O PDF e processado e descartado imediatamente.</p>
      </div>
    </main>
  )
}
"""

# ── src/components/ScoreRing.tsx ──────────────────────────────────────────────

files['src/components/ScoreRing.tsx'] = """'use client'

export function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div className="relative w-28 h-28">
      <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
        <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000"/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl text-stone-50">{score}</span>
        <span className="text-xs text-stone-600">/100</span>
      </div>
    </div>
  )
}
export default ScoreRing

const statusColors = {
  ok:      { text: '#22c55e', bg: 'rgba(34,197,94,0.12)',  bar: '#22c55e' },
  warn:    { text: '#d4a847', bg: 'rgba(212,168,71,0.12)', bar: '#d4a847' },
  crit:    { text: '#ef4444', bg: 'rgba(239,68,68,0.12)',  bar: '#ef4444' },
  neutral: { text: '#a8a29e', bg: 'transparent',           bar: '#a8a29e' },
}

export function MetricCard({ label, value, status, bar, hint }: {
  label: string; value: string; status: 'ok'|'warn'|'crit'|'neutral'
  bar?: { value: number; max: number }; hint?: string
}) {
  const c = statusColors[status]
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <p className="text-xs text-stone-600 mb-2">{label}</p>
      <p className="text-xl mb-2" style={{ color: c.text }}>{value}</p>
      {bar && (
        <div className="h-1 rounded-full mb-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full bar-fill"
            style={{ width: `${Math.min(100,(bar.value/bar.max)*100)}%`, background: c.bar }}/>
        </div>
      )}
      {hint && <p className="text-xs text-stone-700">{hint}</p>}
    </div>
  )
}

const nivelStyles = {
  info: { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', icon: 'i', text: 'text-indigo-300' },
  warn: { bg: 'rgba(212,168,71,0.1)', border: 'rgba(212,168,71,0.2)', icon: '!', text: 'text-amber-300' },
  crit: { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)',  icon: 'x', text: 'text-red-300' },
}

export function AlertaBadge({ alerta }: { alerta: { nivel: 'info'|'warn'|'crit'; msg: string } }) {
  const s = nivelStyles[alerta.nivel]
  return (
    <div className={`flex gap-2.5 px-3 py-2.5 rounded-xl text-sm ${s.text}`}
      style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <span className="text-base flex-shrink-0 mt-px font-bold">{s.icon}</span>
      <span className="leading-snug">{alerta.msg}</span>
    </div>
  )
}
"""

# ── src/components/AlertaBadge.tsx ────────────────────────────────────────────

files['src/components/AlertaBadge.tsx'] = "export { AlertaBadge as default, MetricCard } from './ScoreRing'\n"
files['src/components/MetricCard.tsx']   = "export { MetricCard as default } from './ScoreRing'\n"
files['src/components/Simulador.tsx']    = "export { Simulador as default } from './Recomendacoes'\n"

# ── src/components/TabelaContratos.tsx ───────────────────────────────────────

files['src/components/TabelaContratos.tsx'] = """'use client'

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
"""

# ── src/components/Recomendacoes.tsx ─────────────────────────────────────────

files['src/components/Recomendacoes.tsx'] = """'use client'

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
"""

# ── src/components/Dashboard.tsx ─────────────────────────────────────────────

files['src/components/Dashboard.tsx'] = """'use client'

import { useState } from 'react'
import type { AnaliseResult } from '@/types'
import { ScoreRing, MetricCard, AlertaBadge } from './ScoreRing'
import TabelaContratos from './TabelaContratos'
import { Recomendacoes, Simulador } from './Recomendacoes'

interface Props { resultado: AnaliseResult; onReset: () => void }

const TABS = ['Dashboard', 'Creditos', 'Solucoes', 'Simulador']

export default function Dashboard({ resultado, onReset }: Props) {
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

      <nav className="flex border-b px-6" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((t,i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-3 text-sm transition-colors border-b-2 -mb-px ${
              tab === i ? 'border-amber-400 text-amber-400' : 'border-transparent text-stone-500 hover:text-stone-300'
            }`}>
            {t}
            {t === 'Solucoes' && recomendacoes.length > 0 && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(212,168,71,0.2)', color: 'var(--accent)' }}>{recomendacoes.length}</span>
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
                  : alertas.map((a,i) => <AlertaBadge key={i} alerta={a}/>)}
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
          </div>
        )}
        {tab === 1 && <TabelaContratos contratos={contratos}/>}
        {tab === 2 && <Recomendacoes recomendacoes={recomendacoes}/>}
        {tab === 3 && <Simulador prestacaoActual={metricas.prestacao_mensal} rendimento={resultado.rendimento_mensal}/>}
      </main>
    </div>
  )
}
"""

# ── escreve todos os ficheiros ────────────────────────────────────────────────

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True) if os.path.dirname(path) else None
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  OK  {path}')

print('\nTodos os ficheiros criados com sucesso!')
