import type { Metadata } from 'next'
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
