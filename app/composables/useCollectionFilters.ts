import { ref, computed } from 'vue'

export interface FilterOption {
  id: string
  label: string
  description: string
}

export const useCollectionFilters = (payments: any[]) => {
  const activeFilter = ref('Todos')
  const selectedTags = ref<string[]>([])
  const searchQuery = ref('')
  const sortColumn = ref<string | null>(null)
  const sortDirection = ref<'asc' | 'desc'>('asc')

  const filterOptions: FilterOption[] = [
    { id: 'Todos', label: 'Todos', description: 'Mostra todas as cobranças sem nenhum filtro aplicado.' },
    { id: 'Hoje', label: 'Hoje', description: 'Cobranças que vencem hoje (exclui as já pagas).' },
    { id: 'Crítico', label: 'Crítico (>7d)', description: 'Cobranças atrasadas há mais de uma semana.' },
    { id: 'Cobrados', label: 'Cobrados', description: 'Empresas que já receberam pelo menos um alerta/cobrança.' },
    { id: 'Nao-Cobrados', label: 'Não Cobrados', description: 'Empresas que ainda não receberam nenhum alerta.' },
    { id: 'Sem-WA', label: 'Sem WA', description: 'Empresas que não possuem WhatsApp cadastrado.' },
    { id: 'Pendente', label: 'Pendentes', description: 'Cobranças agendadas que ainda não venceram.' },
    { id: 'Atrasado', label: 'Atrasados', description: 'Todas as cobranças com vencimento ultrapassado.' },
    { id: 'Semana', label: 'Semana', description: 'Todas as cobranças que vencem na semana corrente.' },
    { id: 'Pago', label: 'Pagos', description: 'Histórico completo de cobranças já liquidadas.' },
    { id: 'Churn', label: 'Churn', description: 'Clientes com mais de 30 dias de atraso (Perdidos).' }
  ]

  const hasActiveFilters = computed(() => {
    return activeFilter.value !== 'Todos' || selectedTags.value.length > 0 || searchQuery.value !== ''
  })

  const toggleTag = (tagName: string) => {
    const index = selectedTags.value.indexOf(tagName)
    if (index === -1) {
      selectedTags.value.push(tagName)
    } else {
      selectedTags.value.splice(index, 1)
    }
  }

  const toggleAllTags = (allTags: string[]) => {
    if (selectedTags.value.length === allTags.length) {
      selectedTags.value = []
    } else {
      selectedTags.value = [...allTags]
    }
  }

  const clearTags = () => {
    selectedTags.value = []
  }

  const matchesStatusFilter = (payment: any, filter: string): boolean => {
    const now = new Date()
    
    if (filter === 'Todos') return true
    
    if (filter === 'Hoje') {
      if (!payment.due_date) return false
      const dueDateString = payment.due_date.includes('T') ? payment.due_date : `${payment.due_date}T12:00:00`
      const dueDate = new Date(dueDateString)
      return dueDate.toDateString() === now.toDateString() && payment.status !== 'Pago'
    }
    
    if (filter === 'Crítico') {
      if (!payment.due_date) return false
      const dueDateString = payment.due_date.includes('T') ? payment.due_date : `${payment.due_date}T12:00:00`
      const dueDate = new Date(dueDateString)
      const diffTime = now.getTime() - dueDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return payment.status === 'Atrasado' && diffDays > 7
    }
    
    if (filter === 'Sem-WA') {
      return !payment.company_whatsapp || payment.company_whatsapp.trim() === ''
    }
    
    if (filter === 'Cobrados') {
      return !!payment.last_alert_at
    }
    
    if (filter === 'Nao-Cobrados') {
      return !payment.last_alert_at
    }
    
    if (filter === 'Semana') {
      if (!payment.due_date) return false
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(now)
      endOfWeek.setDate(now.getDate() + (6 - now.getDay()))
      endOfWeek.setHours(23, 59, 59, 999)
      
      const dueDateString = payment.due_date.includes('T') ? payment.due_date : `${payment.due_date}T12:00:00`
      const dueDate = new Date(dueDateString)
      return dueDate >= startOfWeek && dueDate <= endOfWeek
    }
    
    return payment.status === filter
  }

  const filteredPayments = computed(() => {
    let filtered = payments.filter(p => {
      const matchesStatus = matchesStatusFilter(p, activeFilter.value)
      const matchesTag = selectedTags.value.length === 0 || 
                         (p.tags && p.tags.some((t: string) => selectedTags.value.includes(t)))
      const matchesSearch = !searchQuery.value || 
                           p.company_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                           p.amount?.toString().includes(searchQuery.value)
      
      return matchesStatus && matchesTag && matchesSearch
    })

    // Ordenação
    if (sortColumn.value) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortColumn.value!]
        let bVal = b[sortColumn.value!]

        if (sortColumn.value === 'due_date' || sortColumn.value === 'company_created_at') {
          aVal = aVal ? new Date(aVal).getTime() : 0
          bVal = bVal ? new Date(bVal).getTime() : 0
        }

        if (sortColumn.value === 'amount' || sortColumn.value === 'company_ltv') {
          aVal = Number(aVal) || 0
          bVal = Number(bVal) || 0
        }

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = bVal?.toLowerCase() || ''
        }

        if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
        return 0
      })
    }

    // Limitar a 10 registros se não houver filtros ativos
    if (!hasActiveFilters.value) {
      return filtered.slice(0, 10)
    }

    return filtered
  })

  const handleSort = (column: string) => {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = column
      sortDirection.value = 'asc'
    }
  }

  return {
    activeFilter,
    selectedTags,
    searchQuery,
    sortColumn,
    sortDirection,
    filterOptions,
    hasActiveFilters,
    filteredPayments,
    toggleTag,
    toggleAllTags,
    clearTags,
    handleSort
  }
}
