import { onMounted, onUnmounted } from 'vue'

export const useTaskKeyboardShortcuts = (callbacks: {
  onNewTask?: () => void
  onDeleteTask?: () => void
  onEditTask?: () => void
  onSearch?: () => void
  onToggleDashboard?: () => void
}) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl/Cmd + N: Nova tarefa
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault()
      callbacks.onNewTask?.()
    }

    // Ctrl/Cmd + K: Buscar
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      callbacks.onSearch?.()
    }

    // Ctrl/Cmd + D: Toggle Dashboard
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault()
      callbacks.onToggleDashboard?.()
    }

    // Delete: Deletar tarefa selecionada
    if (e.key === 'Delete') {
      const activeElement = document.activeElement as HTMLElement
      if (activeElement?.closest('[data-task-card]')) {
        e.preventDefault()
        callbacks.onDeleteTask?.()
      }
    }

    // E: Editar tarefa selecionada
    if (e.key === 'e' || e.key === 'E') {
      const activeElement = document.activeElement as HTMLElement
      if (activeElement?.closest('[data-task-card]')) {
        e.preventDefault()
        callbacks.onEditTask?.()
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    handleKeyDown
  }
}
