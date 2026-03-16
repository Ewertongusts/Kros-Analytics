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
    console.log('[DRAG-DROP] 🚀 START DRAG', {
      taskId: task.id,
      taskTitle: task.title,
      fromColumnId: columnId,
      timestamp: new Date().toISOString()
    })

    dragState.value.isDragging = true
    dragState.value.taskId = task.id || null
    dragState.value.fromColumnId = columnId
    dragState.value.toColumnId = null
    dragState.value.position = null
    dragState.value.isDropping = false

    console.log('[DRAG-DROP] ✅ START DRAG STATE', dragState.value)
  }

  /**
   * Atualiza a posição durante o drag
   * @param toColumnId - ID da coluna de destino
   * @param position - Posição relativa ('above' ou 'below')
   */
  const moveDrag = (toColumnId: string, position: 'above' | 'below'): void => {
    if (!dragState.value.isDragging) {
      console.warn('[DRAG-DROP] ⚠️ MOVE DRAG - Not dragging, ignoring move')
      return
    }

    console.log('[DRAG-DROP] 📍 MOVE DRAG', {
      taskId: dragState.value.taskId,
      fromColumnId: dragState.value.fromColumnId,
      toColumnId,
      position,
      sameColumn: dragState.value.fromColumnId === toColumnId,
      timestamp: new Date().toISOString()
    })

    dragState.value.toColumnId = toColumnId
    dragState.value.position = position

    console.log('[DRAG-DROP] ✅ MOVE DRAG STATE', dragState.value)
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
      console.warn('[DRAG-DROP] ⚠️ COMPLETE DROP - Invalid state', {
        isDragging: dragState.value.isDragging,
        taskId: dragState.value.taskId
      })
      return
    }

    console.log('[DRAG-DROP] 💾 COMPLETE DROP - Starting', {
      taskId: dragState.value.taskId,
      fromColumnId: dragState.value.fromColumnId,
      toColumnId: dragState.value.toColumnId,
      position: dragState.value.position,
      timestamp: new Date().toISOString()
    })

    // Marcar como "dropping" para evitar múltiplos drops
    dragState.value.isDropping = true

    try {
      const finalToColumnId = dragState.value.toColumnId || dragState.value.fromColumnId || ''
      const finalPosition = dragState.value.position || 'below'

      console.log('[DRAG-DROP] 📤 COMPLETE DROP - Calling moveTaskFn', {
        taskId: dragState.value.taskId,
        fromColumnId: dragState.value.fromColumnId,
        toColumnId: finalToColumnId,
        position: finalPosition
      })

      // Executar a função de movimento
      await moveTaskFn(
        dragState.value.taskId,
        dragState.value.fromColumnId || '',
        finalToColumnId,
        finalPosition
      )

      console.log('[DRAG-DROP] ✅ COMPLETE DROP - Success')
    } catch (error) {
      console.error('[DRAG-DROP] ❌ COMPLETE DROP - Error', {
        error: error instanceof Error ? error.message : String(error),
        taskId: dragState.value.taskId
      })
      throw error
    } finally {
      // Sempre resetar o estado, mesmo se houver erro
      console.log('[DRAG-DROP] 🔄 COMPLETE DROP - Resetting state')
      resetDrag()
    }
  }

  /**
   * Reseta o estado de drag para o inicial
   */
  const resetDrag = (): void => {
    console.log('[DRAG-DROP] 🔄 RESET DRAG', {
      previousState: dragState.value,
      timestamp: new Date().toISOString()
    })

    dragState.value.isDragging = false
    dragState.value.taskId = null
    dragState.value.fromColumnId = null
    dragState.value.toColumnId = null
    dragState.value.position = null
    dragState.value.isDropping = false

    console.log('[DRAG-DROP] ✅ RESET DRAG - Complete', dragState.value)
  }

  /**
   * Cancela o drag sem executar movimento
   */
  const cancelDrag = (): void => {
    console.log('[DRAG-DROP] ❌ CANCEL DRAG', {
      taskId: dragState.value.taskId,
      fromColumnId: dragState.value.fromColumnId,
      timestamp: new Date().toISOString()
    })
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
