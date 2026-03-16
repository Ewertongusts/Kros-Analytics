import { ref, readonly, computed } from 'vue'

/**
 * Tipos de ações que podem ser desfeitas/refeitas
 */
export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'MOVE'

/**
 * Interface para uma ação no histórico
 */
export interface HistoryAction {
  type: ActionType
  data: any
  timestamp: number
  description: string
}

/**
 * Composable para gerenciar histórico de ações (Undo/Redo)
 * Responsabilidade única: Gerenciar stack de ações
 * 
 * Características:
 * - Adicionar ações ao histórico
 * - Desfazer ações (undo)
 * - Refazer ações (redo)
 * - Limpar histórico
 * - Readonly exports
 */
export const useKanban2History = () => {
  const history = ref<HistoryAction[]>([])
  const currentIndex = ref(-1)
  const maxHistorySize = 50 // Máximo de ações no histórico

  /**
   * Adiciona uma ação ao histórico
   */
  const addAction = (action: HistoryAction): void => {
    // Remover ações futuras se houver
    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1)
    }

    // Adicionar nova ação
    history.value.push(action)
    currentIndex.value++

    // Limitar tamanho do histórico
    if (history.value.length > maxHistorySize) {
      history.value.shift()
      currentIndex.value--
    }
  }

  /**
   * Desfaz a última ação
   */
  const undo = (): HistoryAction | null => {
    if (currentIndex.value > 0) {
      currentIndex.value--
      return history.value[currentIndex.value]
    } else if (currentIndex.value === 0) {
      // Se estamos na primeira ação, voltar para -1 (antes de qualquer ação)
      currentIndex.value--
      return null
    }
    return null
  }

  /**
   * Refaz a última ação desfeita
   */
  const redo = (): HistoryAction | null => {
    if (currentIndex.value < history.value.length - 1) {
      currentIndex.value++
      return history.value[currentIndex.value]
    }
    return null
  }

  /**
   * Limpa o histórico
   */
  const clearHistory = (): void => {
    history.value = []
    currentIndex.value = -1
  }

  /**
   * Verifica se pode desfazer
   */
  const canUndo = computed(() => currentIndex.value > 0)

  /**
   * Verifica se pode refazer
   */
  const canRedo = computed(() => currentIndex.value < history.value.length - 1)

  /**
   * Retorna a ação atual
   */
  const currentAction = computed(() => {
    if (currentIndex.value >= 0 && currentIndex.value < history.value.length) {
      return history.value[currentIndex.value]
    }
    return null
  })

  /**
   * Retorna o tamanho do histórico
   */
  const historySize = computed(() => history.value.length)

  /**
   * Retorna o índice atual
   */
  const currentHistoryIndex = computed(() => currentIndex.value)

  return {
    history: readonly(history),
    currentIndex: readonly(currentIndex),
    addAction,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    currentAction,
    historySize,
    currentHistoryIndex
  }
}
