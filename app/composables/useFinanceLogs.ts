import { ref, computed, watch } from 'vue'

export const useFinanceLogs = () => {
  const supabase = useSupabaseClient()
  const logs = ref<any[]>([])
  const loading = ref(true)
  const searchQuery = ref('')
  const typeFilter = ref<'all' | 'cron' | 'manual'>('all')
  const statusFilter = ref<'all' | 'success' | 'error'>('all')
  const currentPage = ref(1)
  const itemsPerPage = 10

  const filteredLogs = computed(() => {
    return logs.value.filter(log => {
      const matchesSearch = !searchQuery.value || 
        log.company_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        log.whatsapp?.includes(searchQuery.value)
      
      const matchesType = typeFilter.value === 'all' || 
        (typeFilter.value === 'cron' && log.is_cron) ||
        (typeFilter.value === 'manual' && !log.is_cron)
      
      const matchesStatus = statusFilter.value === 'all' ||
        (statusFilter.value === 'success' && (log.status.includes('Sucesso') || log.status.includes('Enviado'))) ||
        (statusFilter.value === 'error' && log.status.includes('Erro'))
      
      return matchesSearch && matchesType && matchesStatus
    })
  })

  const totalPages = computed(() => {
    return Math.ceil(filteredLogs.value.length / itemsPerPage)
  })

  const paginatedLogs = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredLogs.value.slice(start, end)
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

  watch([searchQuery, typeFilter, statusFilter], () => {
    currentPage.value = 1
  })

  const fetchLogs = async () => {
    loading.value = true
    try {
      const { data, error } = await (supabase as any)
        .from('message_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
        
      if (error) throw error
      logs.value = data || []
    } catch (err) {
      console.error('Erro ao buscar logs:', err)
    } finally {
      loading.value = false
    }
  }

  const formatDate = (dateValue: string) => {
    const d = new Date(dateValue)
    return d.toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }) + 'h'
  }

  return {
    logs,
    loading,
    searchQuery,
    typeFilter,
    statusFilter,
    currentPage,
    filteredLogs,
    totalPages,
    paginatedLogs,
    visiblePages,
    fetchLogs,
    formatDate
  }
}
