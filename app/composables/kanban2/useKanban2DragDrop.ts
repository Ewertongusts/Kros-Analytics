import { ref, readonly } from 'vue'
import type { Task } from '../useTasks'

/**
 * Estado centralizado de drag-drop
 * Máquina de estados simples sem race conditions
 */
export interface DragState {
  isDragging: boolean
  taskId: string | null
  fromColumnId: string | null
  toColumnId: string | null
  position: 'above' | 'below' | null
  isDropping: boolean
}

/**
 * Composable para gerenciar drag-drop do Kanban 2
 * Responsabilidade única: Estado de drag-drop
 * 
 * Características:
 * - Estado centralizado em um único ref
 * - Sem race conditions
 * - Sem nextTick necessário
 * - Readonly exports (imutabilidade)
 * - Máquina de estados clara
 */
export const useKanban2DragDrop = () => {
  const dragState = ref<DragState>({
    isDragging: false,
    taskId: null,
    fromColumnId: null,
    toColumnId: null,
    position: null,
    isDropping: false
  })

  /**
   * Inicia o drag de uma tarefa
   * @param task - Tarefa sendo arrastada
   * @param columnId - ID da coluna de origem
   */
  const startDrag = (task: Task, columnId: string): void => {
    dragState.value.isDragging = true
    dragState.value.taskId = task.id || null
    dragState.value.fromColumnId = columnId
    dragState.value.toColumnId = null
    dragState.value.position = null
    dragState.value.isDropping = false
  }

  /**
   * Atualiza a posição durante o drag
   * @param toColumnId - ID da coluna de destino
   * @param position - Posição relativa ('above' ou 'below')
   */
  const moveDrag = (toColumnId: string, position: 'above' | 'below'): void => {
    if (!dragState.value.isDragging) return

    dragState.value.toColumnId = toColumnId
    dragState.value.position = position
  }

  /**
   * Completa o drop de forma segura
   * Executa a função de movimento e depois reseta o estado
   * 
   * @param moveTaskFn - Função assíncrona que move a tarefa no banco
   * @returns Promise que resolve quando o drop está completo
   */
  const completeDrop = async (
    moveTaskFn: (
      taskId: string,
      fromColumnId: string,
      toColumnId: string,
      position: 'above' | 'below'
    ) => Promise<void>
  ): Promise<void> => {
    if (!dragState.value.isDragging || !dragState.value.taskId) {
      return
    }

    // Marcar como "dropping" para evitar múltiplos drops
    dragState.value.isDropping = true

    try {
      // Executar a função de movimento
      await moveTaskFn(
        dragState.value.taskId,
        dragState.value.fromColumnId || '',
        dragState.value.toColumnId || dragState.value.fromColumnId || '',
        dragState.value.position || 'below'
      )
    } finally {
      // Sempre resetar o estado, mesmo se houver erro
      resetDrag()
    }
  }

  /**
   * Reseta o estado de drag para o inicial
   */
  const resetDrag = (): void => {
    dragState.value.isDragging = false
    dragState.value.taskId = null
    dragState.value.fromColumnId = null
    dragState.value.toColumnId = null
    dragState.value.position = null
    dragState.value.isDropping = false
  }

  /**
   * Cancela o drag sem executar movimento
   */
  const cancelDrag = (): void => {
    resetDrag()
  }

  return {
    dragState: readonly(dragState),
    startDrag,
    moveDrag,
    completeDrop,
    resetDrag,
    cancelDrag
  }
}
