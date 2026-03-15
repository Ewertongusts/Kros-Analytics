import { ref } from 'vue'

export interface HistoryEntry {
  action: string
  task: any
  previousState: any
  timestamp: number
}

const history = ref<HistoryEntry[]>([])
const historyIndex = ref(-1)

export const useTaskHistory = () => {
  const addToHistory = (entry: HistoryEntry) => {
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push(entry)
    historyIndex.value++
  }

  const undo = (): HistoryEntry | null => {
    if (historyIndex.value > 0) {
      historyIndex.value--
      return history.value[historyIndex.value]
    }
    return null
  }

  const redo = (): HistoryEntry | null => {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      return history.value[historyIndex.value]
    }
    return null
  }

  const canUndo = () => historyIndex.value > 0
  const canRedo = () => historyIndex.value < history.value.length - 1

  const clear = () => {
    history.value = []
    historyIndex.value = -1
  }

  return {
    history,
    historyIndex,
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    clear
  }
}
