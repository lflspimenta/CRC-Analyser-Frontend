'use client'

import { useState, useRef, useEffect } from 'react'
import type { AnaliseResult } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-8bfe4.up.railway.app'

interface Props {
  resultado: AnaliseResult
  pdfFile: File | null
  onTextoGerado?: (texto: string) => void
}

export default function AnaliseIA({ resultado, pdfFile, onTextoGerado }: Props) {
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [texto])

  const analisar = async () => {
    if (!pdfFile) { setError('PDF nao disponivel. Carrega novamente o CRC.'); return }
    setLoading(true); setTexto(''); setDone(false); setError('')

    const form = new FormData()
    form.append('pdf', pdfFile)
    form.append('rendimento_mensal', String(resultado.rendimento_mensal))

    try {
      const res = await fetch(`${API_URL}/analise-ia`, { method: 'POST', body: form })
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Erro') }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let acc = ''

      while (true) {
        const { done: d, value } = await reader.read()
        if (d) break
        acc += decoder.decode(value, { stream: true })
        setTexto(acc)
      }
      setDone(true)
      onTextoGerado?.(acc)
    } catch (e: any) {
      setError(e.message || 'Erro de ligacao.')
    } finally {
      setLoading(false)
    }
  }

  const renderMarkdown = (md: string) => {
    return md.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h3 key={i} className="text-stone-200 font-medium text-base mt-6 mb-3">{line.slice(3)}</h3>
      if (line.startsWith('- ')) return <li key={i} className="text-stone-400 text-sm leading-relaxed ml-4 list-disc">{line.slice(2)}</li>
      if (line.trim() === '') return <div key={i} className="h-2" />
      return <p key={i} className="text-stone-400 text-sm leading-relaxed">{line}</p>
    })
  }

  return (
    <div className="stagger space-y-4">
      <div>
        <h2 className="text-stone-200 font-medium mb-1">Analise por IA</h2>
        <p className="text-sm text-stone-500">Relatorio personalizado gerado pelo Claude com base no teu CRC real.</p>
      </div>

      {!texto && !loading && (
        <div className="rounded-xl p-8 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(212,168,71,0.15)' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 4C8.477 4 4 8.477 4 14s4.477 10 10 10 10-4.477 10-10S19.523 4 14 4Z" stroke="var(--accent)" strokeWidth="1.5"/>
              <path d="M14 9v5l3 3" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-stone-300 text-sm mb-1 font-medium">Analise financeira personalizada</p>
          <p className="text-stone-600 text-xs mb-5">
            O Claude analisa os teus {resultado.metricas.n_contratos} contratos e gera um relatorio com plano de accao concreto. Demora cerca de 15-20 segundos.
          </p>
          {error && <p className="text-red-400 text-xs mb-4 px-4 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>{error}</p>}
          <button onClick={analisar} className="px-6 py-3 rounded-xl text-sm font-medium transition-all" style={{ background: 'var(--accent)', color: '#1c1917' }}>
            Gerar analise IA
          </button>
        </div>
      )}

      {(loading || texto) && (
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {loading && !texto && (
            <div className="flex items-center gap-3 text-stone-500 text-sm mb-4">
              <svg className="animate-spin w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              A analisar o teu perfil financeiro...
            </div>
          )}
          <div ref={containerRef} className="max-h-[500px] overflow-y-auto space-y-1 pr-2">
            {renderMarkdown(texto)}
            {loading && <span className="inline-block w-2 h-4 rounded-sm animate-pulse ml-1" style={{ background: 'var(--accent)' }} />}
          </div>
          {done && (
            <div className="flex gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={analisar} className="text-xs px-3 py-1.5 rounded-lg border transition-colors text-stone-400 hover:text-stone-200" style={{ borderColor: 'var(--border)' }}>
                Regenerar
              </button>
              <p className="text-xs text-stone-600 self-center">
                Para exportar com esta analise incluida, usa o botao "Exportar PDF" no topo.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
