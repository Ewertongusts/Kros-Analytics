import { ref, computed, watch } from 'vue'
import type { Task } from './useTasks'

export interface CardTransitionState {
  taskId: string
  isMoving: boolean
  fromColumn: string
  toColumn: string
  progress: number
  startTime: number
}

export const useCardTransitions = () => {
  const transitionStates = ref<Map<string, CardTransitionState>>(new Map())
  const animatingCards = ref<Set<string>>(new Set())

  // Iniciar transição de card
  const startCardTransition = (
    taskId: string,
    fromColumn: string,
    toColumn: string,
    duration: number = 400
  ) => {
    const state: CardTransitionState = {
      taskId,
      isMoving: true,
      fromColumn,
      toColumn,
      progress: 0,
      startTime: Date.now()
    }

    transitionStates.value.set(taskId, state)
    animatingCards.value.add(taskId)

    // Animar progresso
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const currentState = transitionStates.value.get(taskId)
      if (currentState) {
        currentState.progress = progress
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Finalizar transição
        finishCardTransition(taskId)
      }
    }

    requestAnimationFrame(animate)
  }

  // Finalizar transição de card
  const finishCardTransition = (taskId: string) => {
    const state = transitionStates.value.get(taskId)
    if (state) {
      state.isMoving = false
      state.progress = 1
    }
    animatingCards.value.delete(taskId)

    // Remover do mapa após 500ms
    setTimeout(() => {
      transitionStates.value.delete(taskId)
    }, 500)
  }

  // Cancelar transição
  const cancelCardTransition = (taskId: string) => {
    transitionStates.value.delete(taskId)
    animatingCards.value.delete(taskId)
  }

  // Verificar se card está em transição
  const isCardTransitioning = (taskId: string) => {
    return animatingCards.value.has(taskId)
  }

  // Obter estado de transição
  const getTransitionState = (taskId: string) => {
    return transitionStates.value.get(taskId)
  }

  // Calcular transform baseado no progresso
  const getTransitionTransform = (taskId: string) => {
    const state = getTransitionState(taskId)
    if (!state) return 'translateY(0)'

    // Easing function (ease-out)
    const easeProgress = 1 - Math.pow(1 - state.progress, 3)

    // Animação de entrada suave
    const translateY = (1 - easeProgress) * 20 // Começa 20px abaixo
    const opacity = easeProgress

    return {
      transform: `translateY(${translateY}px)`,
      opacity: opacity
    }
  }

  // Calcular classe de animação
  const getTransitionClass = (taskId: string) => {
    const state = getTransitionState(taskId)
    if (!state) return ''

    if (state.progress < 0.5) {
      return 'card-entering'
    } else {
      return 'card-settling'
    }
  }

  return {
    transitionStates,
    animatingCards,
    startCardTransition,
    finishCardTransition,
    cancelCardTransition,
    isCardTransitioning,
    getTransitionState,
    getTransitionTransform,
    getTransitionClass
  }
}
