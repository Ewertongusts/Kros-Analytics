import { computed } from 'vue'

export const useTaskReports = () => {
  const getTotalByStatus = (tasks: any[]) => {
    return {
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      done: tasks.filter(t => t.status === 'done').length
    }
  }

  const getTotalByPriority = (tasks: any[]) => {
    return {
      alta: tasks.filter(t => t.priority === 'alta').length,
      media: tasks.filter(t => t.priority === 'media').length,
      baixa: tasks.filter(t => t.priority === 'baixa').length
    }
  }

  const getCompletionRate = (tasks: any[]) => {
    if (tasks.length === 0) return 0
    const completed = tasks.filter(t => t.status === 'done').length
    return Math.round((completed / tasks.length) * 100)
  }

  const getAverageTimeInProgress = (tasks: any[]) => {
    const inProgress = tasks.filter(t => t.status === 'in_progress')
    if (inProgress.length === 0) return 0
    
    const totalHours = inProgress.reduce((sum, task) => {
      if (task.time_estimation) {
        return sum + task.time_estimation
      }
      return sum
    }, 0)
    
    return Math.round(totalHours / inProgress.length)
  }

  const getTasksByAssignee = (tasks: any[]) => {
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
    getTasksByAssignee
  }
}
