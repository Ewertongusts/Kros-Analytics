import { ref, computed, watch } from 'vue'
import type { Task } from './useTasks'

export interface CardTransitionState {
  taskId: string
  state: 'idle' | 'entering' | 'exiting' | 'settling'
  fromColumn?: string
  toColumn?: string
  timestamp: number
}

export const useRealtimeCardTransitions = () => {
  const transitionMap = ref<Map<string, CardTransitionState>>(new Map())

  // Iniciar transição de entrada
  const startEntering = (taskId: string, toColumn: string) => {
    console.log(`🎬 Starting ENTER transition for task ${taskId} to column ${toColumn}`)
    transitionMap.value.set(taskId, {
      taskId,
      state: 'entering',
      toColumn,
      timestamp: Date.now()
    })
  }

  // Iniciar transição de saída
  const startExiting = (taskId: string, fromColumn: string) => {
    console.log(`🎬 Starting EXIT transition for task ${taskId} from column ${fromColumn}`)
    transitionMap.value.set(taskId, {
      taskId,
      state: 'exiting',
      fromColumn,
      timestamp: Date.now()
    })
  }

  // Iniciar transição de acomodação
  const startSettling = (taskId: string, toColumn: string) => {
    console.log(`🎬 Starting SETTLE transition for task ${taskId} in column ${toColumn}`)
    transitionMap.value.set(taskId, {
      taskId,
      state: 'settling',
      toColumn,
      timestamp: Date.now()
    })
  }

  // Completar transição
  const completeTransition = (taskId: string) => {
    console.log(`✅ Transition complete for task ${taskId}`)
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
    getActiveTransitions
  }
}
