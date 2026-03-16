import { ref, readonly } from 'vue'
import type { Task } from '../useTasks'
import type { Column } from './useKanban2Data'

/**
 * Composable para sincronização em tempo real com Supabase
 * Responsabilidade única: Gerenciar realtime subscriptions
 * 
 * Características:
 * - Subscribe a mudanças em tarefas
 * - Subscribe a mudanças em colunas
 * - Atualizar estado local automaticamente
 * - Cleanup automático
 */
export const useKanban2Realtime = () => {
  const isConnected = ref(false)
  const error = ref<string | null>(null)
  const subscriptions = ref<any[]>([])

  /**
   * Subscreve a mudanças em tarefas
   */
  const subscribeToTasks = (
    onInsert?: (task: Task) => void,
    onUpdate?: (task: Task) => void,
    onDelete?: (taskId: string) => void
  ) => {
    try {
      const { $supabase } = useNuxtApp()

      const subscription = $supabase
        .channel('tasks-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks'
          },
          (payload: any) => {
            if (payload.eventType === 'INSERT' && onInsert) {
              onInsert(payload.new as Task)
            } else if (payload.eventType === 'UPDATE' && onUpdate) {
              onUpdate(payload.new as Task)
            } else if (payload.eventType === 'DELETE' && onDelete) {
              onDelete(payload.old.id)
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            isConnected.value = true
            error.value = null
          } else if (status === 'CLOSED') {
            isConnected.value = false
          }
        })

      subscriptions.value.push(subscription)
      return subscription
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao subscrever tarefas'
      throw err
    }
  }

  /**
   * Subscreve a mudanças em colunas
   */
  const subscribeToColumns = (
    onInsert?: (column: Column) => void,
    onUpdate?: (column: Column) => void,
    onDelete?: (columnId: string) => void
  ) => {
    try {
      const { $supabase } = useNuxtApp()

      const subscription = $supabase
        .channel('columns-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'kanban_columns'
          },
          (payload: any) => {
            if (payload.eventType === 'INSERT' && onInsert) {
              onInsert(payload.new as Column)
            } else if (payload.eventType === 'UPDATE' && onUpdate) {
              onUpdate(payload.new as Column)
            } else if (payload.eventType === 'DELETE' && onDelete) {
              onDelete(payload.old.id)
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            isConnected.value = true
            error.value = null
          } else if (status === 'CLOSED') {
            isConnected.value = false
          }
        })

      subscriptions.value.push(subscription)
      return subscription
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao subscrever colunas'
      throw err
    }
  }

  /**
   * Desinscreve de todas as subscriptions
   */
  const unsubscribeAll = async () => {
    try {
      const { $supabase } = useNuxtApp()

      for (const subscription of subscriptions.value) {
        await $supabase.removeChannel(subscription)
      }

      subscriptions.value = []
      isConnected.value = false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao desinscrever'
      throw err
    }
  }

  /**
   * Desinscreve de uma subscription específica
   */
  const unsubscribe = async (subscription: any) => {
    try {
      const { $supabase } = useNuxtApp()
      await $supabase.removeChannel(subscription)

      subscriptions.value = subscriptions.value.filter((s) => s !== subscription)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao desinscrever'
      throw err
    }
  }

  return {
    isConnected: readonly(isConnected),
    error: readonly(error),
    subscriptions: readonly(subscriptions),
    subscribeToTasks,
    subscribeToColumns,
    unsubscribeAll,
    unsubscribe
  }
}
