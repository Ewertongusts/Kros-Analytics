import { ref, computed } from 'vue'

export interface Sale {
  id?: number
  representative_name?: string
  name?: string
  monthly_price?: number
  final_value?: number
  payment_status?: string
  created_at?: string
  payment_date?: string
  [key: string]: any
}

export const useSaleFilters = (salesData: any) => {
  const searchQuery = ref('')
  const status = ref('todos')
  const startDate = ref('')
  const endDate = ref('')
  const minValue = ref<number | null>(null)
  const maxValue = ref<number | null>(null)

  const filteredSales = computed(() => {
    let filtered = salesData.value || []

    // Filtro de busca por nome
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter((sale: Sale) => {
        const name = (sale.representative_name || sale.name || '').toLowerCase()
        return name.includes(query)
      })
    }

    // Filtro de status
    if (status.value !== 'todos') {
      filtered = filtered.filter((sale: Sale) => sale.payment_status === status.value)
    }

    // Filtro de data (período)
    if (startDate.value || endDate.value) {
      filtered = filtered.filter((sale: Sale) => {
        const saleDate = sale.payment_date || sale.created_at
        if (!saleDate) return false

        const date = new Date(saleDate)
        const start = startDate.value ? new Date(startDate.value) : null
        const end = endDate.value ? new Date(endDate.value) : null

        if (start && date < start) return false
        if (end && date > end) return false

        return true
      })
    }

    // Filtro de valor (range)
    if (minValue.value !== null || maxValue.value !== null) {
      filtered = filtered.filter((sale: Sale) => {
        const value = sale.final_value || sale.monthly_price || 0
        
        if (minValue.value !== null && value < minValue.value) return false
        if (maxValue.value !== null && value > maxValue.value) return false

        return true
      })
    }

    return filtered
  })

  const clearFilters = () => {
    searchQuery.value = ''
    status.value = 'todos'
    startDate.value = ''
    endDate.value = ''
    minValue.value = null
    maxValue.value = null
  }

  const activeFiltersCount = computed(() => {
    let count = 0
    if (searchQuery.value) count++
    if (status.value !== 'todos') count++
    if (startDate.value || endDate.value) count++
    if (minValue.value !== null || maxValue.value !== null) count++
    return count
  })

  return {
    searchQuery,
    status,
    startDate,
    endDate,
    minValue,
    maxValue,
    filteredSales,
    clearFilters,
    activeFiltersCount
  }
}
