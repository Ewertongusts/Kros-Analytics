import { computed } from 'vue'

export const useCollectionRow = (payment: any) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const formatDate = (date: string) => {
    if (!date) return '-'
    const safeDate = date.includes('T') ? date : `${date}T12:00:00`
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(safeDate))
  }

  const formatDateTimeTiny = (date: string) => {
    if (!date) return '-'
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
  }

  const formatTimeAgo = (date: string) => {
    if (!date) return ''
    const now = new Date()
    const then = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Agora'
    
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes}min`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return '1 dia'
    if (diffInDays < 7) return `${diffInDays} dias`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks === 1) return '1 sem'
    if (diffInWeeks < 4) return `${diffInWeeks} sem`
    
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths === 1) return '1 mês'
    return `${diffInMonths} meses`
  }

  const isUrgentAlert = computed(() => {
    if (!payment.last_alert_at || payment.status !== 'Atrasado') return false
    const lastAlert = new Date(payment.last_alert_at).getTime()
    const now = new Date().getTime()
    return (now - lastAlert) > 24 * 60 * 60 * 1000
  })

  const avatarClass = computed(() => {
    switch (payment.status?.toLowerCase()) {
      case 'pago': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
      case 'pendente': return 'bg-amber-500/10 border-amber-500/20 text-amber-500'
      case 'atrasado': return 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
      case 'churn': return 'bg-red-950/40 border-red-500/30 text-red-700'
      default: return 'bg-white/5 border-white/10 text-white/40'
    }
  })

  return {
    formatCurrency,
    formatDate,
    formatDateTimeTiny,
    formatTimeAgo,
    isUrgentAlert,
    avatarClass
  }
}
