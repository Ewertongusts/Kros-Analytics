import { computed } from 'vue'
import type { Task } from '~/composables/useTasks'

export const useTaskReports = () => {
  const getTotalByStatus = (tasks: Task[]) => {
    return {
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      done: tasks.filter(t => t.status === 'done').length
    }
  }

  const getTotalByPriority = (tasks: Task[]) => {
    return {
      alta: tasks.filter(t => t.priority === 'alta').length,
      media: tasks.filter(t => t.priority === 'media').length,
      baixa: tasks.filter(t => t.priority === 'baixa').length
    }
  }

  const getCompletionRate = (tasks: Task[]) => {
    if (tasks.length === 0) return 0
    const completed = tasks.filter(t => t.status === 'done').length
    return Math.round((completed / tasks.length) * 100)
  }

  const getAverageTimeInProgress = (tasks: Task[]) => {
    const inProgress = tasks.filter(t => t.status === 'in_progress')
    if (inProgress.length === 0) return 0
    
    const totalTime = inProgress.reduce((acc, task) => {
      if (task.created_at) {
        const createdDate = new Date(task.created_at).getTime()
        const now = new Date().getTime()
        const hours = (now - createdDate) / (1000 * 60 * 60)
        return acc + hours
      }
      return acc
    }, 0)
    
    return Math.round(totalTime / inProgress.length)
  }

  const getOverdueTasks = (tasks: Task[]) => {
    return tasks.filter(task => {
      if (!task.due_date || task.status === 'done') return false
      return new Date(task.due_date) < new Date()
    })
  }

  const getTasksByAssignee = (tasks: Task[]) => {
    const assignees: Record<string, number> = {}
    tasks.forEach(task => {
      if (task.assigned_to) {
        assignees[task.assigned_to] = (assignees[task.assigned_to] || 0) + 1
      }
    })
    return assignees
  }

  return {
    getTotalByStatus,
    getTotalByPriority,
    getCompletionRate,
    getAverageTimeInProgress,
    getOverdueTasks,
    getTasksByAssignee
  }
}
