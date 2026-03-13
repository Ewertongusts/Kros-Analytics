/**
 * Configuração de CRON para automação de mensagens
 * Define horários, segmentação e templates de mensagens
 */

export interface CronSchedule {
  id: string
  name: string
  hour: number
  minute: number
  enabled: boolean
  description: string
  filters: CronFilters
  template: string
}

export interface CronFilters {
  daysUntilDue: {
    min: number
    max: number
  }
  paymentStatus: ('pending' | 'overdue' | 'paid' | 'cancelled')[]
  onlyActive: boolean
  excludeAutoBilling: boolean
  maxMessagesPerDay: number
}

/**
 * Configurações de CRON pré-definidas
 * Cada uma dispara em um horário específico com filtros diferentes
 */
export const cronSchedules: CronSchedule[] = [
  {
    id: 'morning-reminder',
    name: 'Lembrete Matinal',
    hour: 9,
    minute: 0,
    enabled: true,
    description: 'Envia lembretes para pagamentos vencendo HOJE',
    filters: {
      daysUntilDue: { min: 0, max: 0 }, // Vence hoje
      paymentStatus: ['pending'],
      onlyActive: true,
      excludeAutoBilling: false,
      maxMessagesPerDay: 500
    },
    template: `Olá {empresa}! 👋

Seu pagamento de {plano} vence HOJE.

💰 Valor: {valor}
📅 Vencimento: {vencimento}

Clique aqui para pagar: {link_pagamento}

Obrigado!`
  },

  {
    id: 'afternoon-warning',
    name: 'Aviso Intermediário',
    hour: 14,
    minute: 0,
    enabled: true,
    description: 'Envia avisos para pagamentos vencendo em 3 dias',
    filters: {
      daysUntilDue: { min: 1, max: 3 }, // Vence em 1-3 dias
      paymentStatus: ['pending'],
      onlyActive: true,
      excludeAutoBilling: false,
      maxMessagesPerDay: 500
    },
    template: `Olá {empresa}! ⏰

Seu pagamento vence em {dias_restantes} dias.

💰 Valor: {valor}
📅 Vencimento: {vencimento}
📦 Plano: {plano}

Não deixe para última hora! Pague agora: {link_pagamento}`
  },

  {
    id: 'evening-urgent',
    name: 'Aviso Urgente',
    hour: 18,
    minute: 0,
    enabled: true,
    description: 'Envia avisos urgentes para pagamentos vencendo amanhã',
    filters: {
      daysUntilDue: { min: 1, max: 1 }, // Vence amanhã
      paymentStatus: ['pending'],
      onlyActive: true,
      excludeAutoBilling: false,
      maxMessagesPerDay: 500
    },
    template: `Olá {empresa}! 🚨

ATENÇÃO: Seu pagamento vence AMANHÃ!

💰 Valor: {valor}
📅 Vencimento: {vencimento}

Pague agora para evitar atrasos: {link_pagamento}`
  },

  {
    id: 'overdue-collection',
    name: 'Cobrança de Atraso',
    hour: 10,
    minute: 0,
    enabled: true,
    description: 'Envia cobranças para pagamentos atrasados (1-7 dias)',
    filters: {
      daysUntilDue: { min: -7, max: -1 }, // Atrasado 1-7 dias
      paymentStatus: ['overdue'],
      onlyActive: true,
      excludeAutoBilling: true, // Não enviar se tem auto-billing
      maxMessagesPerDay: 300
    },
    template: `Olá {empresa}! ⚠️

Seu pagamento está ATRASADO há {dias_restantes} dias.

💰 Valor: {valor}
📅 Vencimento: {vencimento}
⏳ Total em atraso: {valor_total_pendente}

Regularize sua situação agora: {link_pagamento}`
  },

  {
    id: 'severe-overdue',
    name: 'Cobrança Severa',
    hour: 11,
    minute: 0,
    enabled: true,
    description: 'Envia cobranças para pagamentos muito atrasados (7+ dias)',
    filters: {
      daysUntilDue: { min: -999, max: -7 }, // Atrasado 7+ dias
      paymentStatus: ['overdue'],
      onlyActive: true,
      excludeAutoBilling: true,
      maxMessagesPerDay: 200
    },
    template: `Olá {empresa}! 🔴

Seu pagamento está VENCIDO há {dias_restantes} dias!

⚠️ AÇÃO NECESSÁRIA IMEDIATAMENTE

💰 Valor: {valor}
📅 Vencimento: {vencimento}
⏳ Total em atraso: {valor_total_pendente}

Sua conta pode ser suspensa. Pague agora: {link_pagamento}`
  }
]

/**
 * Configurações globais de CRON
 */
export const globalCronConfig = {
  // Horário de início e fim para envios (não enviar fora desse horário)
  quietHours: {
    start: 22, // 22:00
    end: 8     // 08:00
  },

  // Pausar envios em fins de semana
  pauseWeekends: false,

  // Pausar envios em feriados (lista de datas)
  pauseHolidays: [
    '2024-01-01', // Ano Novo
    '2024-02-13', // Carnaval
    '2024-03-29', // Sexta-feira Santa
    '2024-04-21', // Tiradentes
    '2024-05-01', // Dia do Trabalho
    '2024-09-07', // Independência
    '2024-10-12', // Nossa Senhora Aparecida
    '2024-11-02', // Finados
    '2024-11-20', // Consciência Negra
    '2024-12-25'  // Natal
  ],

  // Retry automático em caso de falha
  retry: {
    enabled: true,
    maxAttempts: 3,
    delayMinutes: 60
  },

  // Logging e relatórios
  logging: {
    enabled: true,
    logSuccessfulMessages: true,
    logFailedMessages: true,
    generateDailyReport: true
  }
}

/**
 * Função auxiliar para verificar se deve enviar mensagens
 */
export function shouldSendMessages(date: Date = new Date()): {
  allowed: boolean
  reason?: string
} {
  const hour = date.getHours()
  const dayOfWeek = date.getDay()
  const dateStr = date.toISOString().split('T')[0]

  // Verificar quiet hours
  if (hour >= globalCronConfig.quietHours.start || hour < globalCronConfig.quietHours.end) {
    return {
      allowed: false,
      reason: `Fora do horário de envio (${globalCronConfig.quietHours.end}h - ${globalCronConfig.quietHours.start}h)`
    }
  }

  // Verificar fins de semana
  if (globalCronConfig.pauseWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
    return {
      allowed: false,
      reason: 'Envios pausados nos fins de semana'
    }
  }

  // Verificar feriados
  if (globalCronConfig.pauseHolidays.includes(dateStr)) {
    return {
      allowed: false,
      reason: 'Envios pausados em feriados'
    }
  }

  return { allowed: true }
}

/**
 * Função para calcular dias até vencimento
 */
export function calculateDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}
