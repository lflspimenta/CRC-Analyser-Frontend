'use client'

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
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Por favor carrega um ficheiro PDF.')
      return
    }
    setFile(f)
    setError('')
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDrag(true) }
  const onDragLeave = () => setDrag(false)

  const analisar = async () => {
    if (!file) { setError('Selecciona o PDF do CRC.'); return }
    if (!rendimento || Number(rendimento) <= 0) { setError('Introduz o rendimento líquido mensal.'); return }

    setLoading(true)
    setError('')

    const form = new FormData()
    form.append('pdf', file)
    form.append('rendimento_mensal', rendimento)

    try {
      const res = await fetch(`${API_URL}/analisar`, { method: 'POST', body: form })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Erro ao processar o PDF.')
      }
      const data: AnaliseResult = await res.json()
      setResultado(data)
    } catch (e: any) {
      setError(e.message || 'Erro de ligação. Verifica a tua ligação à internet.')
    } finally {
      setLoading(false)
    }
  }

  if (resultado) {
    return <Dashboard resultado={resultado} onReset={() => setResultado(null)} />
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">

      {/* Background grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />

      <div className="w-full max-w-lg stagger">

        {/* Logo / título */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 12V4l6-2 6 2v8l-6 2-6-2Z" stroke="#1c1917" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 2v12M2 8h12" stroke="#1c1917" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="text-sm font-medium tracking-widest uppercase text-stone-400">CRC Analyser</span>
          </div>
          <h1 className="font-display text-4xl text-stone-50 leading-tight mb-3">
            Entende a tua<br />situação de crédito
          </h1>
          <p className="text-stone-400 text-sm leading-relaxed">
            Carrega o teu Mapa de Responsabilidades de Crédito<br />
            e obtém uma análise financeira em segundos.
          </p>
        </div>

        {/* Upload zone */}
        <div
          className={`upload-zone rounded-2xl p-8 text-center cursor-pointer mb-4 ${drag ? 'drag-over' : ''}`}
          style={{ background: 'var(--surface)' }}
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {file ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(212,168,71,0.15)' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4a2 2 0 0 1 2-2h5l5 5v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z" stroke="#d4a847" strokeWidth="1.5"/>
                  <path d="M11 2v5h5" stroke="#d4a847" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="text-stone-200 text-sm font-medium truncate max-w-[220px]">{file.name}</p>
                <p className="text-stone-500 text-xs">{(file.size / 1024).toFixed(0)} KB · PDF</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setFile(null) }}
                className="ml-auto text-stone-600 hover:text-stone-400 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16V8M9 11l3-3 3 3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 16.5A4 4 0 0 0 16 12H15a7 7 0 1 0-6.5 9.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-stone-300 text-sm mb-1">Arrasta o PDF aqui ou clica para seleccionar</p>
              <p className="text-stone-600 text-xs">
                Mapa de Responsabilidades de Crédito · Banco de Portugal
              </p>
            </>
          )}
        </div>

        {/* Link BdP */}
        <p className="text-center text-xs text-stone-600 mb-6">
          Não tens o PDF?{' '}
          <a
            href="https://clientebancario.bportugal.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-stone-400 transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            Obtém gratuitamente em clientebancario.bportugal.pt
          </a>
        </p>

        {/* Rendimento */}
        <div className="mb-4">
          <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">
            Rendimento líquido mensal (€)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 text-sm">€</span>
            <input
              type="number"
              min="0"
              step="100"
              placeholder="ex: 1 500"
              value={rendimento}
              onChange={e => setRendimento(e.target.value)}
              className="w-full pl-8 pr-4 py-3.5 rounded-xl text-sm text-stone-100 placeholder-stone-700 outline-none transition-all"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <p className="text-xs text-stone-600 mt-1.5">
            Usado apenas para calcular a taxa de esforço. Não é guardado.
          </p>
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-300"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {/* Botão analisar */}
        <button
          onClick={analisar}
          disabled={loading}
          className="w-full py-4 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--accent)', color: '#1c1917' }}
          onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.background = 'var(--accent-dim)' }}
          onMouseLeave={e => { if (!loading) (e.target as HTMLElement).style.background = 'var(--accent)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              A analisar o CRC…
            </span>
          ) : 'Analisar CRC'}
        </button>

        {/* Privacidade */}
        <p className="text-center text-xs text-stone-700 mt-5">
          O PDF é processado e descartado imediatamente. Nenhum dado é guardado.
        </p>
      </div>
    </main>
  )
}
