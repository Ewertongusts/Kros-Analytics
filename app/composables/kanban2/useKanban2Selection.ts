import { ref, readonly, computed } from 'vue'

/**
 * Composable para gerenciar seleção de cards do Kanban 2
 * Responsabilidade única: Gerenciar checkboxes e seleção múltipla
 * 
 * Características:
 * - Toggle selection de cards individuais
 * - Select all / Clear all
 * - Check if selected
 * - Readonly exports
 * - Usa Set para performance O(1)
 */
export const useKanban2Selection = () => {
  const selectedTaskIds = ref<Set<string>>(new Set())

  /**
   * Alterna a seleção de uma tarefa
   */
  const toggleSelection = (taskId: string): void => {
    if (selectedTaskIds.value.has(taskId)) {
      selectedTaskIds.value.delete(taskId)
    } else {
      selectedTaskIds.value.add(taskId)
    }
  }

  /**
   * Seleciona todas as tarefas
   */
  const selectAll = (taskIds: string[]): void => {
    selectedTaskIds.value.clear()
    taskIds.forEach(id => selectedTaskIds.value.add(id))
  }

  /**
   * Limpa a seleção
   */
  const clearSelection = (): void => {
    selectedTaskIds.value.clear()
  }

  /**
   * Verifica se uma tarefa está selecionada
   */
  const isSelected = (taskId: string): boolean => {
    return selectedTaskIds.value.has(taskId)
  }

  /**
   * Retorna a quantidade de tarefas selecionadas
   */
  const selectionCount = computed(() => selectedTaskIds.value.size)

  /**
   * Verifica se há alguma seleção
   */
  const hasSelection = computed(() => selectedTaskIds.value.size > 0)

  /**
   * Retorna array com IDs selecionados
   */
  const selectedIds = computed(() => Array.from(selectedTaskIds.value))

  /**
   * Inverte a seleção (seleciona não-selecionados, desseleciona selecionados)
   */
  const invertSelection = (allTaskIds: string[]): void => {
    const newSelection = new Set<string>()
    allTaskIds.forEach(id => {
      if (!selectedTaskIds.value.has(id)) {
        newSelection.add(id)
      }
    })
    selectedTaskIds.value = newSelection
  }

  /**
   * Remove uma tarefa da seleção
   */
  const removeFromSelection = (taskId: string): void => {
    selectedTaskIds.value.delete(taskId)
  }

  /**
   * Adiciona uma tarefa à seleção
   */
  const addToSelection = (taskId: string): void => {
    selectedTaskIds.value.add(taskId)
  }

  /**
   * Seleciona múltiplas tarefas
   */
  const selectMultiple = (taskIds: string[]): void => {
    taskIds.forEach(id => selectedTaskIds.value.add(id))
  }

  /**
   * Desseleciona múltiplas tarefas
   */
  const deselectMultiple = (taskIds: string[]): void => {
    taskIds.forEach(id => selectedTaskIds.value.delete(id))
  }

  return {
    selectedTaskIds: readonly(selectedTaskIds),
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    selectionCount,
    hasSelection,
    selectedIds,
    invertSelection,
    removeFromSelection,
    addToSelection,
    selectMultiple,
    deselectMultiple
  }
}
