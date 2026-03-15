import { ref, computed } from 'vue'
import type { Task } from './useTasks'

export interface Subtask extends Task {
  parent_task_id?: string
}

export const useSubtasks = () => {
  const supabase = useSupabaseClient()
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch subtasks for a parent task
  const fetchSubtasks = async (parentTaskId: string): Promise<Subtask[]> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('tasks')
        .select('*')
        .eq('parent_task_id', parentTaskId)
        .order('created_at', { ascending: true })

      if (err) throw err
      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch subtasks'
      return []
    } finally {
      loading.value = false
    }
  }

  // Create a new subtask
  const createSubtask = async (parentTaskId: string, subtaskData: Partial<Subtask>): Promise<Subtask | null> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('tasks')
        .insert([
          {
            ...subtaskData,
            parent_task_id: parentTaskId,
            status: 'todo',
            priority: subtaskData.priority || 'media'
          }
        ])
        .select()
        .single()

      if (err) throw err
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create subtask'
      return null
    } finally {
      loading.value = false
    }
  }

  // Update a subtask
  const updateSubtask = async (subtaskId: string, updates: Partial<Subtask>): Promise<Subtask | null> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', subtaskId)
        .select()
        .single()

      if (err) throw err
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update subtask'
      return null
    } finally {
      loading.value = false
    }
  }

  // Delete a subtask
  const deleteSubtask = async (subtaskId: string): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null

      const { error: err } = await supabase
        .from('tasks')
        .delete()
        .eq('id', subtaskId)

      if (err) throw err
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete subtask'
      return false
    } finally {
      loading.value = false
    }
  }

  // Get completion percentage for a task
  const getCompletionPercentage = async (parentTaskId: string): Promise<number> => {
    try {
      const subtasks = await fetchSubtasks(parentTaskId)
      if (subtasks.length === 0) return 0

      const completed = subtasks.filter(st => st.status === 'done').length
      return Math.round((completed / subtasks.length) * 100)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to calculate completion'
      return 0
    }
  }

  return {
    loading,
    error,
    fetchSubtasks,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    getCompletionPercentage
  }
}
