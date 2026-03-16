import { computed, type ComputedRef } from 'vue'
import type { Task } from '../useTasks'

/**
 * Composable para memoização de valores computados
 * Responsabilidade única: Gerenciar valores memoizados para evitar re-renders
 * 
 * Características:
 * - Memoizar tarefas por coluna
 * - Memoizar tarefas selecionadas
 * - Memoizar tarefas filtradas
 * - Memoizar tarefas ordenadas
 */
export const useKanban2Memoization = () => {
  /**
   * Cria um valor memoizado para tarefas de uma coluna
   */
  const memoizeTasksByColumn = (
    tasks: Task[],
    columnId: string
  ): ComputedRef<Task[]> => {
    return computed(() => {
      return tasks.filter(task => task.column_id === columnId)
    })
  }

  /**
   * Cria um valor memoizado para tarefas selecionadas
   */
  const memoizeSelectedTasks = (
    tasks: Task[],
    selectedIds: Set<string>
  ): ComputedRef<Task[]> => {
    return computed(() => {
      return tasks.filter(task => selectedIds.has(task.id || ''))
    })
  }

  /**
   * Cria um valor memoizado para tarefas filtradas
   */
  const memoizeFilteredTasks = (
    tasks: Task[],
    filterFn: (task: Task) => boolean
  ): ComputedRef<Task[]> => {
    return computed(() => {
      return tasks.filter(filterFn)
    })
  }

  /**
   * Cria um valor memoizado para tarefas ordenadas
   */
  const memoizeSortedTasks = (
    tasks: Task[],
    sortFn: (a: Task, b: Task) => number
  ): ComputedRef<Task[]> => {
    return computed(() => {
      return [...tasks].sort(sortFn)
    })
  }

  /**
   * Cria um valor memoizado para contagem de tarefas
   */
  const memoizeTaskCount = (tasks: Task[]): ComputedRef<number> => {
    return computed(() => tasks.length)
  }

  /**
   * Cria um valor memoizado para tarefas agrupadas
   */
  const memoizeGroupedTasks = (
    tasks: Task[],
    groupByFn: (task: Task) => string
  ): ComputedRef<Map<string, Task[]>> => {
    return computed(() => {
      const grouped = new Map<string, Task[]>()
      tasks.forEach(task => {
        const key = groupByFn(task)
        if (!grouped.has(key)) {
          grouped.set(key, [])
        }
        grouped.get(key)!.push(task)
      })
      return grouped
    })
  }

  /**
   * Cria um valor memoizado para tarefas por status
   */
  const memoizeTasksByStatus = (tasks: Task[]): ComputedRef<Map<string, Task[]>> => {
    return memoizeGroupedTasks(tasks, task => task.status)
  }

  /**
   * Cria um valor memoizado para tarefas por prioridade
   */
  const memoizeTasksByPriority = (tasks: Task[]): ComputedRef<Map<string, Task[]>> => {
    return memoizeGroupedTasks(tasks, task => task.priority)
  }

  /**
   * Cria um valor memoizado para estatísticas de tarefas
   */
  const memoizeTaskStats = (
    tasks: Task[]
  ): ComputedRef<{
    total: number
    byStatus: Record<string, number>
    byPriority: Record<string, number>
  }> => {
    return computed(() => {
      const stats = {
        total: tasks.length,
        byStatus: {} as Record<string, number>,
        byPriority: {} as Record<string, number>
      }

      tasks.forEach(task => {
        // Contar por status
        stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1

        // Contar por prioridade
        stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1
      })

      return stats
    })
  }

  return {
    memoizeTasksByColumn,
    memoizeSelectedTasks,
    memoizeFilteredTasks,
    memoizeSortedTasks,
    memoizeTaskCount,
    memoizeGroupedTasks,
    memoizeTasksByStatus,
    memoizeTasksByPriority,
    memoizeTaskStats
  }
}
