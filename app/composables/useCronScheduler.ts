/**
 * Composable para gerenciar agendamento de CRON com períodos
 */

export const useCronScheduler = () => {
  const periods = {
    morning: { start: 7, end: 11, label: 'Manhã' },
    afternoon: { start: 11, end: 14, label: 'Tarde' },
    evening: { start: 14, end: 19, label: 'Noite' }
  }

  /**
   * Gera um horário aleatório dentro de um período
   * Com variação de 5-10 minutos
   */
  const generateRandomTime = (period: 'morning' | 'afternoon' | 'evening'): string => {
    const { start, end } = periods[period]
    const totalMinutes = (end - start) * 60
    const randomMinutes = Math.floor(Math.random() * totalMinutes)
    const hour = start + Math.floor(randomMinutes / 60)
    const minute = randomMinutes % 60

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  /**
   * Calcula a próxima execução baseado no período
   */
  const calculateNextExecution = (period: 'morning' | 'afternoon' | 'evening'): { time: string; nextExecution: Date } => {
    const time = generateRandomTime(period)
    const [hour, minute] = time.split(':').map(Number)

    const next = new Date()
    next.setHours(hour, minute, 0, 0)

    // Se já passou hoje, agendar para amanhã
    if (next < new Date()) {
      next.setDate(next.getDate() + 1)
    }

    return { time, nextExecution: next }
  }

  /**
   * Formata data para exibição
   */
  const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d)
  }

  /**
   * Retorna label do período
   */
  const getPeriodLabel = (period: string): string => {
    return periods[period as keyof typeof periods]?.label || period
  }

  return {
    periods,
    generateRandomTime,
    calculateNextExecution,
    formatDate,
    getPeriodLabel
  }
}
