export interface Contrato {
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
