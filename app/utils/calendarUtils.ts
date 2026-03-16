export const formatAppointmentDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
  if (dateOnly.getTime() === todayOnly.getTime()) return 'Hoje'
  if (dateOnly.getTime() === tomorrowOnly.getTime()) return 'Amanhã'
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).format(date)
}

export const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    'done': 'Concluído',
    'in_progress': 'Em Progresso',
    'todo': 'A Fazer',
    'concluida': 'Concluída',
    'em_progresso': 'Em Progresso',
    'a_fazer': 'A Fazer',
    'pendente': 'Pendente',
    'completed': 'Concluída',
    'cancelled': 'Cancelada',
    'cancelada': 'Cancelada'
  }
  return map[status] || status
}

export const getStatusColor = (status: string): string => {
  if (['done', 'concluida', 'completed'].includes(status)) return 'bg-green-500/20 text-green-300'
  if (['in_progress', 'em_progresso'].includes(status)) return 'bg-blue-500/20 text-blue-300'
  if (['todo', 'a_fazer', 'pendente', 'pending'].includes(status)) return 'bg-yellow-500/20 text-yellow-300'
  return 'bg-gray-500/20 text-gray-300'
}

export const getTaskClasses = (priority: string): string => {
  return priority === 'alta' ? 'bg-red-500/40 text-red-100 border border-red-500/60' :
         priority === 'media' ? 'bg-yellow-500/40 text-yellow-100 border border-yellow-500/60' :
         'bg-blue-500/40 text-blue-100 border border-blue-500/60'
}
