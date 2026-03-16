import { computed, ref, type Ref } from 'vue'
import type { Task } from '~/composables/useTasks'

export const useCalendarLogic = (tasks: Ref<Task[]>) => {
  const currentDate = ref(new Date())

  const monthYear = computed(() => {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate.value)
  })

  const weekAppointments = computed(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    const endOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()))
    endOfWeek.setHours(23, 59, 59, 999)
    return tasks.value
      .filter(task => {
        if (!task.due_date) return false
        const taskDate = new Date(task.due_date)
        return taskDate >= startOfWeek && taskDate <= endOfWeek
      })
      .sort((a, b) => {
        const dateA = new Date(a.due_date!)
        const dateB = new Date(b.due_date!)
        if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime()
        const priorityOrder = { alta: 0, media: 1, baixa: 2 }
        return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) - (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2)
      })
  })

  const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const isCurrentMonth = date.getMonth() === month
      const isToday = date.getTime() === today.getTime()
      const dayTasks = tasks.value
        .filter(task => {
          if (!task.due_date) return false
          const taskDate = new Date(task.due_date)
          taskDate.setHours(0, 0, 0, 0)
          return taskDate.getTime() === date.getTime()
        })
        .sort((a, b) => {
          const priorityOrder = { alta: 0, media: 1, baixa: 2 }
          return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) - (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2)
        })
      days.push({ date: date.getDate(), isCurrentMonth, isToday, tasks: dayTasks })
    }
    return days
  })

  const previousMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
  }

  const nextMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
  }

  const todayBtn = () => {
    currentDate.value = new Date()
  }

  return {
    monthYear,
    weekAppointments,
    calendarDays,
    previousMonth,
    nextMonth,
    todayBtn
  }
}
