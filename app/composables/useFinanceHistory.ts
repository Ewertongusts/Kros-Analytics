import { ref, computed, watch } from 'vue'

export const useFinanceHistory = (history: any[]) => {
  // Inicializa com o mês atual
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0] || ''
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0] || ''

  const startDate = ref<string>(firstDay)
  const endDate = ref<string>(lastDay)
  const searchQuery = ref('')
  const planFilter = ref<string>('all')
  const currentPage = ref(1)
  const itemsPerPage = 10

  const filteredHistory = computed(() => {
    return history.filter(p => {
      if (!p.paid_at) return false
      const payDate = p.paid_at.split('T')[0]
      return payDate >= startDate.value && payDate <= endDate.value
    }).sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime())
  })

  const searchFilteredHistory = computed(() => {
    let filtered = filteredHistory.value

    if (searchQuery.value) {
      filtered = filtered.filter(p => 
        p.companies?.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }

    if (planFilter.value !== 'all') {
      filtered = filtered.filter(p => p.plan_name === planFilter.value)
    }

    return filtered
  })

  const availablePlans = computed(() => {
    const plans = new Set<string>()
    filteredHistory.value.forEach(p => {
      if (p.plan_name) plans.add(p.plan_name)
    })
    return Array.from(plans).sort()
  })

  const totalPages = computed(() => {
    return Math.ceil(searchFilteredHistory.value.length / itemsPerPage)
  })

  const paginatedHistory = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return searchFilteredHistory.value.slice(start, end)
  })

  const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages.value, start + maxVisible - 1)
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  })

  const totalReceived = computed(() => {
    return searchFilteredHistory.value.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
  })

  watch([searchQuery, planFilter, startDate, endDate], () => {
    currentPage.value = 1
  })

  return {
    startDate,
    endDate,
    searchQuery,
    planFilter,
    currentPage,
    searchFilteredHistory,
    availablePlans,
    totalPages,
    paginatedHistory,
    visiblePages,
    totalReceived
  }
}
