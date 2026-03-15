import { ref, computed } from 'vue'
import type { Task } from './useTasks'

export interface AdvancedFilters {
  search: string
  status: string[]
  priority: string[]
  assigned_to: string[]
  company_id: string[]
  date_from: string
  date_to: string
  due_date_from: string
  due_date_to: string
  has_estimation: boolean | null
  estimation_min: number
  estimation_max: number
  has_subtasks: boolean | null
  has_attachments: boolean | null
  has_comments: boolean | null
  tags: string[]
  overdue_only: boolean
}

export const useAdvancedFilters = () => {
  const filters = ref<AdvancedFilters>({
    search: '',
    status: [],
    priority: [],
    assigned_to: [],
    company_id: [],
    date_from: '',
    date_to: '',
    due_date_from: '',
    due_date_to: '',
    has_estimation: null,
    estimation_min: 0,
    estimation_max: 999,
    has_subtasks: null,
    has_attachments: null,
    has_comments: null,
    tags: [],
    overdue_only: false
  })

  // Verificar se há filtros ativos
  const hasActiveFilters = computed(() => {
    return (
      filters.value.search.trim() !== '' ||
      filters.value.status.length > 0 ||
      filters.value.priority.length > 0 ||
      filters.value.assigned_to.length > 0 ||
      filters.value.company_id.length > 0 ||
      filters.value.date_from !== '' ||
      filters.value.date_to !== '' ||
      filters.value.due_date_from !== '' ||
      filters.value.due_date_to !== '' ||
      filters.value.has_estimation !== null ||
      filters.value.estimation_min > 0 ||
      filters.value.estimation_max < 999 ||
      filters.value.has_subtasks !== null ||
      filters.value.has_attachments !== null ||
      filters.value.has_comments !== null ||
      filters.value.tags.length > 0 ||
      filters.value.overdue_only
    )
  })

  // Aplicar filtros a um array de tarefas
  const applyFilters = (tasks: Task[]): Task[] => {
    return tasks.filter(task => {
      // Busca por texto
      if (filters.value.search.trim()) {
        const searchLower = filters.value.search.toLowerCase()
        const matchesSearch =
          task.title?.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          (task as any).company_name?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Filtro por status
      if (filters.value.status.length > 0) {
        if (!filters.value.status.includes(task.status || '')) return false
      }

      // Filtro por prioridade
      if (filters.value.priority.length > 0) {
        if (!filters.value.priority.includes(task.priority || '')) return false
      }

      // Filtro por responsável
      if (filters.value.assigned_to.length > 0) {
        if (!filters.value.assigned_to.includes(task.assigned_to || '')) return false
      }

      // Filtro por empresa
      if (filters.value.company_id.length > 0) {
        if (!filters.value.company_id.includes((task as any).company_id || '')) return false
      }

      // Filtro por data de criação
      if (filters.value.date_from) {
        const taskDate = new Date(task.created_at || '')
        const filterDate = new Date(filters.value.date_from)
        if (taskDate < filterDate) return false
      }

      if (filters.value.date_to) {
        const taskDate = new Date(task.created_at || '')
        const filterDate = new Date(filters.value.date_to)
        filterDate.setHours(23, 59, 59, 999)
        if (taskDate > filterDate) return false
      }

      // Filtro por data de vencimento
      if (filters.value.due_date_from) {
        if (!task.due_date) return false
        const taskDate = new Date(task.due_date)
        const filterDate = new Date(filters.value.due_date_from)
        if (taskDate < filterDate) return false
      }

      if (filters.value.due_date_to) {
        if (!task.due_date) return false
        const taskDate = new Date(task.due_date)
        const filterDate = new Date(filters.value.due_date_to)
        filterDate.setHours(23, 59, 59, 999)
        if (taskDate > filterDate) return false
      }

      // Filtro por estimativa
      if (filters.value.has_estimation !== null) {
        const hasEst = ((task as any).estimated_hours || 0) > 0 || ((task as any).estimated_days || 0) > 0
        if (filters.value.has_estimation !== hasEst) return false
      }

      // Filtro por range de estimativa
      if (filters.value.has_estimation !== false) {
        const hours = ((task as any).estimated_hours || 0) + (((task as any).estimated_days || 0) * 8)
        if (hours < filters.value.estimation_min || hours > filters.value.estimation_max) {
          if (hours > 0) return false
        }
      }

      // Filtro por subtarefas
      if (filters.value.has_subtasks !== null) {
        const hasSubtasks = ((task as any).subtask_count || 0) > 0
        if (filters.value.has_subtasks !== hasSubtasks) return false
      }

      // Filtro por tags
      if (filters.value.tags.length > 0) {
        const taskTags = Array.isArray(task.tags) ? task.tags : []
        const hasAllTags = filters.value.tags.every(tag => taskTags.includes(tag))
        if (!hasAllTags) return false
      }

      // Filtro por tarefas atrasadas
      if (filters.value.overdue_only) {
        if (!task.due_date || task.status === 'done') return false
        const dueDate = new Date(task.due_date)
        if (dueDate >= new Date()) return false
      }

      return true
    })
  }

  // Limpar todos os filtros
  const clearFilters = () => {
    filters.value = {
      search: '',
      status: [],
      priority: [],
      assigned_to: [],
      company_id: [],
      date_from: '',
      date_to: '',
      due_date_from: '',
      due_date_to: '',
      has_estimation: null,
      estimation_min: 0,
      estimation_max: 999,
      has_subtasks: null,
      has_attachments: null,
      has_comments: null,
      tags: [],
      overdue_only: false
    }
  }

  // Resetar um filtro específico
  const resetFilter = (filterName: keyof AdvancedFilters) => {
    const defaults: Record<keyof AdvancedFilters, any> = {
      search: '',
      status: [],
      priority: [],
      assigned_to: [],
      company_id: [],
      date_from: '',
      date_to: '',
      due_date_from: '',
      due_date_to: '',
      has_estimation: null,
      estimation_min: 0,
      estimation_max: 999,
      has_subtasks: null,
      has_attachments: null,
      has_comments: null,
      tags: [],
      overdue_only: false
    }
    ;(filters.value[filterName] as any) = defaults[filterName]
  }

  // Contar filtros ativos
  const activeFilterCount = computed(() => {
    let count = 0
    if (filters.value.search.trim()) count++
    if (filters.value.status.length > 0) count++
    if (filters.value.priority.length > 0) count++
    if (filters.value.assigned_to.length > 0) count++
    if (filters.value.company_id.length > 0) count++
    if (filters.value.date_from) count++
    if (filters.value.date_to) count++
    if (filters.value.due_date_from) count++
    if (filters.value.due_date_to) count++
    if (filters.value.has_estimation !== null) count++
    if (filters.value.estimation_min > 0 || filters.value.estimation_max < 999) count++
    if (filters.value.has_subtasks !== null) count++
    if (filters.value.has_attachments !== null) count++
    if (filters.value.has_comments !== null) count++
    if (filters.value.tags.length > 0) count++
    if (filters.value.overdue_only) count++
    return count
  })

  return {
    filters,
    hasActiveFilters,
    activeFilterCount,
    applyFilters,
    clearFilters,
    resetFilter
  }
}
