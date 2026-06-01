'use client'

import { useState } from 'react'
import type { AnaliseResult } from '@/types'

interface Props {
  resultado: AnaliseResult
  analiseIA?: string
}

export default function ExportarPDF({ resultado, analiseIA }: Props) {
  const [loading, setLoading] = useState(false)

  const exportar = async () => {
    setLoading(true)
    try {
      // importa jsPDF dinamicamente
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const { metricas, alertas, contratos, recomendacoes } = resultado
      const pageW = 210
      const margin = 18
      const contentW = pageW - margin * 2
      let y = 20

      // helpers
      const addLine = (text: string, size = 10, bold = false, color = [30, 30, 30] as [number,number,number]) => {
        doc.setFontSize(size)
        doc.setFont('helvetica', bold ? 'bold' : 'normal')
        doc.setTextColor(...color)
        const lines = doc.splitTextToSize(text, contentW)
        lines.forEach((line: string) => {
          if (y > 272) { doc.addPage(); y = 20 }
          doc.text(line, margin, y)
          y += size * 0.45
        })
        y += 2
      }

      const addSection = (title: string) => {
        y += 4
        if (y > 260) { doc.addPage(); y = 20 }
        doc.setFillColor(245, 243, 240)
        doc.rect(margin - 3, y - 5, contentW + 6, 9, 'F')
        addLine(title, 11, true, [30, 30, 30])
        y += 1
      }

      const addKV = (label: string, value: string, valueColor?: [number,number,number]) => {
        if (y > 272) { doc.addPage(); y = 20 }
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(100, 100, 100)
        doc.text(label + ':', margin, y)
        doc.setFont('helvetica', 'normal')
        if (valueColor) doc.setTextColor(...valueColor)
        else doc.setTextColor(30, 30, 30)
        doc.text(value, margin + 55, y)
        y += 5.5
      }

      // ── CABEÇALHO ──────────────────────────────────────────────────────────
      doc.setFillColor(28, 25, 23)
      doc.rect(0, 0, 210, 32, 'F')
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(212, 168, 71)
      doc.text('CRC Analyser', margin, 14)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(160, 160, 150)
      doc.text('Mapa de Responsabilidades de Credito — Banco de Portugal', margin, 21)
      doc.setTextColor(120, 120, 110)
      doc.text(`Emitido em ${new Date().toLocaleDateString('pt-PT')}`, margin, 28)
      y = 42

      // ── DADOS DO TITULAR ──────────────────────────────────────────────────
      addSection('Dados do Titular')
      addKV('Nome', resultado.titular)
      addKV('Referente a', resultado.referente_a)
      addKV('Data de emissao CRC', resultado.data_emissao)
      addKV('Rendimento liquido mensal', `${resultado.rendimento_mensal.toLocaleString('pt-PT')} EUR`)

      // ── SCORE ─────────────────────────────────────────────────────────────
      addSection('Score de Saude Financeira')
      const scoreColor: [number,number,number] = metricas.score_saude >= 75 ? [34,197,94] : metricas.score_saude >= 50 ? [212,168,71] : [239,68,68]
      addKV('Score', `${metricas.score_saude} / 100`, scoreColor)
      const scoreLabel = metricas.score_saude >= 75 ? 'Situacao saudavel' : metricas.score_saude >= 50 ? 'Situacao moderada' : 'Situacao de risco'
      addKV('Classificacao', scoreLabel)

      // ── METRICAS ──────────────────────────────────────────────────────────
      addSection('Metricas Financeiras')
      const teColor: [number,number,number] = metricas.taxa_esforco_pct > 50 ? [239,68,68] : metricas.taxa_esforco_pct > 35 ? [212,168,71] : [34,197,94]
      addKV('Taxa de esforco', `${metricas.taxa_esforco_pct.toFixed(1)}% (limite: 35%)`, teColor)
      const drColor: [number,number,number] = metricas.racio_divida_rendimento > 3 ? [212,168,71] : [34,197,94]
      addKV('Racio divida / rendimento', `${metricas.racio_divida_rendimento.toFixed(1)}x (alerta acima de 3x)`, drColor)
      addKV('Divida efectiva total', `${metricas.divida_efetiva.toLocaleString('pt-PT', {maximumFractionDigits:2})} EUR`)
      addKV('Divida potencial (cartoes)', `${metricas.divida_potencial.toLocaleString('pt-PT', {maximumFractionDigits:2})} EUR`)
      addKV('Endividamento total', `${metricas.endividamento_total.toLocaleString('pt-PT', {maximumFractionDigits:2})} EUR`)
      addKV('Prestacao mensal total', `${metricas.prestacao_mensal.toFixed(2)} EUR`)
      addKV('Incumprimentos', metricas.incumprimento_total === 0 ? 'Nenhum' : `${metricas.incumprimento_total.toFixed(2)} EUR`,
        metricas.incumprimento_total > 0 ? [239,68,68] : [34,197,94])
      addKV('Num. contratos', `${metricas.n_contratos}`)
      addKV('Num. instituicoes', `${metricas.n_instituicoes}`)

      // ── ALERTAS ───────────────────────────────────────────────────────────
      if (alertas.length > 0) {
        addSection('Alertas')
        alertas.forEach(a => {
          const color: [number,number,number] = a.nivel === 'crit' ? [239,68,68] : a.nivel === 'warn' ? [212,168,71] : [99,102,241]
          const prefix = a.nivel === 'crit' ? '[CRITICO] ' : a.nivel === 'warn' ? '[ATENCAO] ' : '[INFO] '
          if (y > 272) { doc.addPage(); y = 20 }
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(...color)
          doc.text(prefix, margin, y)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(60, 60, 60)
          const lines = doc.splitTextToSize(a.msg, contentW - 20)
          doc.text(lines, margin + 20, y)
          y += lines.length * 4.5 + 2
        })
      }

      // ── CONTRATOS ─────────────────────────────────────────────────────────
      addSection(`Contratos Activos (${contratos.length})`)
      contratos.forEach((c, idx) => {
        if (y > 255) { doc.addPage(); y = 20 }
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(50, 50, 50)
        doc.text(`${idx + 1}. ${c.produto}`, margin, y)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        doc.text(`${c.instituicao}`, margin + 5, y + 4.5)
        doc.text(`Divida: ${c.total_em_divida.toFixed(2)} EUR  |  Prestacao: ${c.prestacao.toFixed(2)} EUR/mes  |  Fim: ${c.fim === '9999-12-31' ? 'Sem prazo' : c.fim}`, margin + 5, y + 9)
        doc.text(`Tipo: ${c.tipo_responsabilidade}  |  Negociacao: ${c.tipo_negociacao || 'Geral'}  |  Devedores: ${c.n_devedores}`, margin + 5, y + 13.5)
        y += 20
        // linha separadora
        doc.setDrawColor(220, 218, 215)
        doc.line(margin, y - 3, margin + contentW, y - 3)
      })

      // ── RECOMENDACOES ─────────────────────────────────────────────────────
      if (recomendacoes.length > 0) {
        addSection('Solucoes Recomendadas')
        recomendacoes.forEach((r, idx) => {
          if (y > 255) { doc.addPage(); y = 20 }
          const impColor: [number,number,number] =
            r.impacto === 'critico' ? [239,68,68] :
            r.impacto === 'alto' ? [212,168,71] :
            r.impacto === 'medio' ? [99,102,241] : [34,197,94]
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(...impColor)
          doc.text(`[${r.impacto.toUpperCase()}]`, margin, y)
          doc.setTextColor(40, 40, 40)
          doc.text(`${idx + 1}. ${r.titulo}`, margin + 18, y)
          y += 5
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(80, 80, 80)
          const lines = doc.splitTextToSize(r.descricao, contentW - 5)
          lines.forEach((line: string) => {
            if (y > 272) { doc.addPage(); y = 20 }
            doc.text(line, margin + 5, y)
            y += 4.5
          })
          y += 3
        })
      }

      // ── ANÁLISE IA (se disponível) ────────────────────────────────────────
      if (analiseIA && analiseIA.trim()) {
        doc.addPage()
        y = 20
        addSection('Analise Detalhada por IA')
        // limpa markdown
        const textoLimpo = analiseIA
          .replace(/## /g, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
        addLine(textoLimpo, 9, false, [60, 60, 60])
      }

      // ── RODAPÉ ────────────────────────────────────────────────────────────
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(160, 160, 150)
        doc.text(
          `CRC Analyser  |  Pagina ${i} de ${pageCount}  |  Dados confidenciais — uso exclusivo do titular`,
          margin, 291
        )
      }

      // guarda o PDF
      const nomeFile = `CRC_Analise_${resultado.referente_a.replace(/\s/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`
      doc.save(nomeFile)
    } catch (e) {
      console.error('Erro ao gerar PDF:', e)
      alert('Erro ao gerar o PDF. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={exportar}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-50"
      style={{ border: '1px solid var(--border)', color: 'var(--color-stone-400)', background: 'transparent' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 12h10M8 2v7M5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {loading ? 'A gerar PDF...' : 'Exportar PDF'}
    </button>
  )
}
