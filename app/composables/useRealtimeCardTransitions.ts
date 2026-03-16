import { ref, computed } from 'vue'

export interface CardTransitionState {
  taskId: string
  state: 'idle' | 'entering' | 'exiting' | 'settling'
  fromColumn?: string
  toColumn?: string
  timestamp: number
}

export const useRealtimeCardTransitions = () => {
  const transitionMap = ref<Map<string, CardTransitionState>>(new Map())
  const MAX_TRANSITIONS = 500
  const TRANSITION_TIMEOUT = 5000 // 5 segundos
  let cleanupInterval: ReturnType<typeof setInterval> | null = null

  // Cleanup periódico de transições antigas
  const cleanupOldTransitions = () => {
    const now = Date.now()
    const entriesToDelete: string[] = []

    transitionMap.value.forEach((state, taskId) => {
      // Se transição está há mais de 5 segundos, remover
      if (now - state.timestamp > TRANSITION_TIMEOUT) {
        entriesToDelete.push(taskId)
      }
    })

    entriesToDelete.forEach(taskId => {
      transitionMap.value.delete(taskId)
    })

    // Se exceder limite, remover as mais antigas
    if (transitionMap.value.size > MAX_TRANSITIONS) {
      const entries = Array.from(transitionMap.value.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const excess = entries.length - MAX_TRANSITIONS
      for (let i = 0; i < excess; i++) {
        const entry = entries[i]
        if (entry) {
          transitionMap.value.delete(entry[0])
        }
      }
    }
  }

  // Executar cleanup a cada 2 segundos (apenas no browser)
  if (typeof window !== 'undefined') {
    cleanupInterval = setInterval(cleanupOldTransitions, 2000)
  }

  // Função para parar o cleanup
  const stopCleanup = () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval)
      cleanupInterval = null
    }
  }

  const startEntering = (taskId: string, toColumn: string) => {
    try {
      transitionMap.value.set(taskId, {
        taskId,
        state: 'entering',
        toColumn,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Erro ao iniciar entering:', error)
    }
  }

  const startExiting = (taskId: string, fromColumn: string) => {
    try {
      transitionMap.value.set(taskId, {
        taskId,
        state: 'exiting',
        fromColumn,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Erro ao iniciar exiting:', error)
    }
  }

  const startSettling = (taskId: string, toColumn: string) => {
    try {
      transitionMap.value.set(taskId, {
        taskId,
        state: 'settling',
        toColumn,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Erro ao iniciar settling:', error)
    }
  }

  // Completar transição
  const completeTransition = (taskId: string) => {
    transitionMap.value.delete(taskId)
  }

  // Obter estado de transição
  const getTransitionState = (taskId: string) => {
    return transitionMap.value.get(taskId)
  }

  // Verificar se está em transição
  const isTransitioning = (taskId: string) => {
    const state = transitionMap.value.get(taskId)
    return state && state.state !== 'idle'
  }

  // Verificar se está entrando
  const isEntering = (taskId: string) => {
    const state = transitionMap.value.get(taskId)
    return state?.state === 'entering'
  }

  // Verificar se está saindo
  const isExiting = (taskId: string) => {
    const state = transitionMap.value.get(taskId)
    return state?.state === 'exiting'
  }

  // Verificar se está se acomodando
  const isSettling = (taskId: string) => {
    const state = transitionMap.value.get(taskId)
    return state?.state === 'settling'
  }

  // Limpar todas as transições
  const clearAll = () => {
    transitionMap.value.clear()
  }

  // Obter todas as transições ativas
  const getActiveTransitions = computed(() => {
    return Array.from(transitionMap.value.values())
  })

  return {
    transitionMap,
    startEntering,
    startExiting,
    startSettling,
    completeTransition,
    getTransitionState,
    isTransitioning,
    isEntering,
    isExiting,
    isSettling,
    clearAll,
    getActiveTransitions,
    stopCleanup
  }
}
