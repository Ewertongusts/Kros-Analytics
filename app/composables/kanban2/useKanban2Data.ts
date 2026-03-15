import { ref, readonly } from 'vue'
import type { Task } from '../useTasks'

/**
 * Interface para coluna do Kanban
 */
export interface Column {
  id: string
  name: string
  color?: string
  order: number
  created_at: string
  updated_at: string
}

/**
 * Composable para gerenciar dados do Kanban 2
 * Responsabilidade única: Fetch, CRUD e sincronização de dados
 * 
 * Características:
 * - Fetch de tarefas e colunas do Supabase
 * - CRUD operations (create, read, update, delete)
 * - Error handling
 * - Loading states
 * - Readonly exports
 */
export const useKanban2Data = () => {
  const tasks = ref<Task[]>([])
  const columns = ref<Column[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Busca todas as tarefas do Supabase
   */
  const fetchTasks = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const { $fetch } = useNuxtApp()
      const data = await $fetch('/api/tasks')
      tasks.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar tarefas'
      tasks.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Busca todas as colunas do Supabase
   */
  const fetchColumns = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const { $fetch } = useNuxtApp()
      const data = await $fetch('/api/kanban/columns')
      columns.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar colunas'
      columns.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Move uma tarefa para outra coluna/posição
   */
  const moveTask = async (
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    position: 'above' | 'below'
  ): Promise<void> => {
    error.value = null

    try {
      const { $fetch } = useNuxtApp()
      await $fetch('/api/tasks/move', {
        method: 'POST',
        body: {
          taskId,
          fromColumnId,
          toColumnId,
          position
        }
      })

      // Atualizar estado local
      const taskIndex = tasks.value.findIndex(t => t.id === taskId)
      if (taskIndex !== -1) {
        tasks.value[taskIndex].column_id = toColumnId
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao mover tarefa'
      throw err
    }
  }

  /**
   * Cria uma nova tarefa
   */
  const addTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
    error.value = null

    try {
      const { $fetch } = useNuxtApp()
      const newTask = await $fetch('/api/tasks', {
        method: 'POST',
        body: task
      })

      tasks.value.push(newTask)
      return newTask
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar tarefa'
      throw err
    }
  }

  /**
   * Atualiza uma tarefa existente
   */
  const updateTask = async (
    taskId: string,
    updates: Partial<Task>
  ): Promise<void> => {
    error.value = null

    try {
      const { $fetch } = useNuxtApp()
      await $fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: updates
      })

      // Atualizar estado local
      const taskIndex = tasks.value.findIndex(t => t.id === taskId)
      if (taskIndex !== -1) {
        tasks.value[taskIndex] = { ...tasks.value[taskIndex], ...updates }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar tarefa'
      throw err
    }
  }

  /**
   * Deleta uma tarefa
   */
  const deleteTask = async (taskId: string): Promise<void> => {
    error.value = null

    try {
      const { $fetch } = useNuxtApp()
      await $fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      // Remover do estado local
      tasks.value = tasks.value.filter(t => t.id !== taskId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar tarefa'
      throw err
    }
  }

  /**
   * Cria uma nova coluna
   */
  const addColumn = async (name: string, color?: string): Promise<Column> => {
    error.value = null

    try {
      const { $fetch } = useNuxtApp()
      const newColumn = await $fetch('/api/kanban/columns', {
        method: 'POST',
        body: {
          name,
          color,
          order: columns.value.length
        }
      })

      columns.value.push(newColumn)
      return newColumn
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar coluna'
      throw err
    }
  }

  /**
   * Atualiza uma coluna existente
   */
  const updateColumn = async (
    columnId: string,
    updates: Partial<Column>
  ): Promise<void> => {
    error.value = null

    try {
      const { $fetch } = useNuxtApp()
      await $fetch(`/api/kanban/columns/${columnId}`, {
        method: 'PATCH',
        body: updates
      })

      // Atualizar estado local
      const columnIndex = columns.value.findIndex(c => c.id === columnId)
      if (columnIndex !== -1) {
        columns.value[columnIndex] = { ...columns.value[columnIndex], ...updates }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar coluna'
      throw err
    }
  }

  /**
   * Deleta uma coluna
   */
  const deleteColumn = async (columnId: string): Promise<void> => {
    error.value = null

    try {
      const { $fetch } = useNuxtApp()
      await $fetch(`/api/kanban/columns/${columnId}`, {
        method: 'DELETE'
      })

      // Remover do estado local
      columns.value = columns.value.filter(c => c.id !== columnId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar coluna'
      throw err
    }
  }

  /**
   * Reordena as colunas
   */
  const reorderColumns = async (columnIds: string[]): Promise<void> => {
    error.value = null

    try {
      const { $fetch } = useNuxtApp()
      await $fetch('/api/kanban/columns/reorder', {
        method: 'POST',
        body: { columnIds }
      })

      // Atualizar ordem local
      const newColumns = columnIds
        .map(id => columns.value.find(c => c.id === id))
        .filter((c): c is Column => c !== undefined)
        .map((c, index) => ({ ...c, order: index }))

      columns.value = newColumns
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao reordenar colunas'
      throw err
    }
  }

  /**
   * Busca tarefas de uma coluna específica
   */
  const getTasksByColumn = (columnId: string): Task[] => {
    return tasks.value.filter(t => t.column_id === columnId)
  }

  /**
   * Busca uma tarefa por ID
   */
  const getTaskById = (taskId: string): Task | undefined => {
    return tasks.value.find(t => t.id === taskId)
  }

  /**
   * Busca uma coluna por ID
   */
  const getColumnById = (columnId: string): Column | undefined => {
    return columns.value.find(c => c.id === columnId)
  }

  return {
    tasks: readonly(tasks),
    columns: readonly(columns),
    loading: readonly(loading),
    error: readonly(error),
    fetchTasks,
    fetchColumns,
    moveTask,
    addTask,
    updateTask,
    deleteTask,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    getTasksByColumn,
    getTaskById,
    getColumnById
  }
}
