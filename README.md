# CRC Analyser — Frontend

Interface web em Next.js 14 para o analisador do Mapa de Responsabilidades de Crédito.

## Estrutura

```
src/
├── app/
│   ├── layout.tsx       ← fontes, metadata, CSS global
│   ├── page.tsx         ← página de upload (ecrã inicial)
│   └── globals.css      ← variáveis de design e animações
├── components/
│   ├── Dashboard.tsx    ← ecrã de resultados com tabs
│   ├── ScoreRing.tsx    ← anel de score + MetricCard + AlertaBadge
│   ├── TabelaContratos.tsx
│   ├── Recomendacoes.tsx
│   └── Simulador.tsx
└── types.ts             ← tipos TypeScript da resposta da API
```

## Instalação local

```bash
npm install

# copia e preenche as variáveis de ambiente
cp .env.example .env.local
# edita .env.local com o URL do teu backend Railway

npm run dev
```

Abre http://localhost:3000

## Deploy na Vercel

1. Cria conta em vercel.com (gratuita)
2. New Project → Import do GitHub repo
3. Em **Environment Variables**, adiciona:
   ```
   NEXT_PUBLIC_API_URL = https://teu-url.up.railway.app
   ```
4. Deploy — a Vercel detecta Next.js automaticamente

A cada `git push` para o branch `main`, o deploy é automático.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base do backend Railway (sem `/` no fim) |
