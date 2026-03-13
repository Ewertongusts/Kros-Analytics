import { ref, computed, watch } from 'vue'

export const useClientsFilters = (companiesRef: any) => {
  const searchQuery = ref('')
  const sortColumn = ref<'name' | 'representative_name' | 'created_at' | 'is_active'>('created_at')
  const sortDirection = ref<'asc' | 'desc'>('desc')
  const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  const filteredCompanies = computed(() => {
    const companies = Array.isArray(companiesRef) ? companiesRef : companiesRef.value || []
    let result = [...companies]

    // Filtro por busca
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(c =>
        c.name?.toLowerCase().includes(query) ||
        c.representative_name?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query)
      )
    }

    // Filtro por status
    if (statusFilter.value === 'active') {
      result = result.filter(c => c.is_active === true)
    } else if (statusFilter.value === 'inactive') {
      result = result.filter(c => c.is_active === false)
    }

    // Ordenação
    result.sort((a, b) => {
      let aVal = a[sortColumn.value]
      let bVal = b[sortColumn.value]

      if (sortColumn.value === 'created_at') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
      return 0
    })

    return result
  })

  const paginatedCompanies = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredCompanies.value.slice(start, end)
  })

  const totalPages = computed(() => {
    return Math.ceil(filteredCompanies.value.length / itemsPerPage.value)
  })

  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  const handleSort = (column: 'name' | 'representative_name' | 'created_at' | 'is_active') => {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = column
      sortDirection.value = 'asc'
    }
    currentPage.value = 1
  }

  const nextPage = () => {
    if (hasNextPage.value) currentPage.value++
  }

  const prevPage = () => {
    if (hasPrevPage.value) currentPage.value--
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  return {
    searchQuery,
    sortColumn,
    sortDirection,
    statusFilter,
    currentPage,
    itemsPerPage,
    filteredCompanies,
    paginatedCompanies,
    totalPages,
    hasNextPage,
    hasPrevPage,
    handleSort,
    nextPage,
    prevPage,
    goToPage
  }
}
