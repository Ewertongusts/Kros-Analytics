import { ref, computed, watch } from 'vue'

export interface FilterOption {
  id: string
  label: string
  description: string
}

export const useCollectionFilters = (payments: any[], externalRefs?: any) => {
  // Usar refs externos se fornecidos (do useViewPreferences), senão criar novos
  const activeFilter = externalRefs?.activeFilter || ref('Todos')
  const selectedTags = externalRefs?.selectedTags || ref<string[]>([])
  const subscriptionStatusFilter = externalRefs?.subscriptionStatusFilter || ref<string[]>([])
  const searchQuery = externalRefs?.searchQuery || ref('')
  const sortColumn = ref<string | null>(null)
  const sortDirection = ref<'asc' | 'desc'>('asc')
  
  // Paginação
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

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
    return activeFilter.value !== 'Todos' || selectedTags.value.length > 0 || searchQuery.value !== '' || subscriptionStatusFilter.value.length > 0
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

  const toggleSubscriptionStatus = (status: string) => {
    const index = subscriptionStatusFilter.value.indexOf(status)
    if (index === -1) {
      subscriptionStatusFilter.value.push(status)
    } else {
      subscriptionStatusFilter.value.splice(index, 1)
    }
  }

  const clearSubscriptionStatus = () => {
    subscriptionStatusFilter.value = []
  }

  const matchesStatusFilter = (payment: any, filter: string): boolean => {
    const now = new Date()
    
    if (filter === 'Todos') return true
    
    if (filter === 'Hoje') {
      if (!payment.due_day) return false
      
      // Para o filtro HOJE, verificar se o due_day é igual ao dia atual
      const today = new Date()
      const currentDay = today.getDate()
      
      return payment.due_day === currentDay && payment.status !== 'Pago'
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
      if (!payment.due_day) return false
      
      // Para o filtro SEMANA, verificar se o due_day está na semana atual
      const today = new Date()
      
      // Calcular início e fim da semana atual
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(today)
      endOfWeek.setDate(today.getDate() + (6 - today.getDay()))
      endOfWeek.setHours(23, 59, 59, 999)
      
      // Extrair os dias da semana (8 a 14 para a semana atual)
      const startDay = startOfWeek.getDate()
      const endDay = endOfWeek.getDate()
      
      // Verificar se o due_day está dentro do range da semana atual
      return payment.due_day >= startDay && payment.due_day <= endDay
    }
    
    // Para outros filtros baseados em status
    if (['Pendente', 'Pago', 'Atrasado'].includes(filter)) {
      return payment.status === filter
    }
    
    return false
  }

  const filteredPayments = computed(() => {
    let filtered = payments.filter(p => {
      const matchesStatus = matchesStatusFilter(p, activeFilter.value)
      const matchesTag = selectedTags.value.length === 0 || 
                         (p.tags && p.tags.some((t: string) => selectedTags.value.includes(t)))
      
      // Busca melhorada: cliente, empresa, valor
      const matchesSearch = !searchQuery.value || 
                           p.company_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                           p.company_actual_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                           p.amount?.toString().includes(searchQuery.value)
      
      const matchesSubscriptionStatus = subscriptionStatusFilter.value.length === 0 ||
                                        subscriptionStatusFilter.value.includes(p.subscription_status)
      
      return matchesStatus && matchesTag && matchesSearch && matchesSubscriptionStatus
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

    return filtered
  })

  // Dados paginados
  const paginatedPayments = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredPayments.value.slice(start, end)
  })

  // Informações de paginação
  const totalPages = computed(() => {
    return Math.ceil(filteredPayments.value.length / itemsPerPage.value)
  })

  const hasNextPage = computed(() => {
    return currentPage.value < totalPages.value
  })

  const hasPrevPage = computed(() => {
    return currentPage.value > 1
  })

  // Funções de paginação
  const nextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  const prevPage = () => {
    if (hasPrevPage.value) {
      currentPage.value--
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  // Reset página quando filtros mudam
  const resetPage = () => {
    currentPage.value = 1
  }

  // Watch para resetar página quando filtros mudam
  watch([activeFilter, selectedTags, searchQuery, subscriptionStatusFilter], () => {
    currentPage.value = 1
  })

  const handleSort = (column: string) => {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = column
      sortDirection.value = 'asc'
    }
    resetPage() // Reset para página 1 ao ordenar
  }

  return {
    activeFilter,
    selectedTags,
    subscriptionStatusFilter,
    searchQuery,
    sortColumn,
    sortDirection,
    filterOptions,
    hasActiveFilters,
    filteredPayments,
    paginatedPayments, // ← Novo: dados paginados
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    itemsPerPage,
    toggleTag,
    toggleAllTags,
    clearTags,
    toggleSubscriptionStatus,
    clearSubscriptionStatus,
    handleSort,
    nextPage, // ← Novo
    prevPage, // ← Novo
    goToPage, // ← Novo
    resetPage // ← Novo
  }
}