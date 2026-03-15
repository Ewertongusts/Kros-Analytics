import { ref } from 'vue'

export const useAdvancedTransitions = () => {
  const syncingTasks = ref<Set<string>>(new Set())

  // Helper para adicionar classe com timeout automático
  const addClassWithTimeout = (selector: string, className: string, duration: number = 600) => {
    try {
      const element = document.querySelector(selector)
      if (!element) return
      
      element.classList.add(className)
      
      setTimeout(() => {
        try {
          if (element && element.parentElement) {
            element.classList.remove(className)
          }
        } catch (e) {
          console.error(`Erro ao remover classe ${className}:`, e)
        }
      }, duration)
    } catch (error) {
      console.error(`Erro ao adicionar classe ${className}:`, error)
    }
  }

  // 1. Animar coluna receptora
  const animateColumnReceiving = (columnId: string) => {
    addClassWithTimeout(`[data-column="${columnId}"]`, 'column-receiving', 600)
  }

  // 2. Animar cards vizinhos
  const animateNearbyCards = (columnId: string, excludeTaskId: string) => {
    try {
      const cards = document.querySelectorAll(`[data-column="${columnId}"] [data-task]`)
      if (cards.length === 0) return
      
      cards.forEach((card, index) => {
        try {
          if (card.getAttribute('data-task') !== excludeTaskId) {
            card.classList.add('card-reordering')
            const element = card as HTMLElement
            element.style.animationDelay = `${index * 50}ms`
            
            setTimeout(() => {
              try {
                if (card && card.parentElement) {
                  card.classList.remove('card-reordering')
                }
              } catch (e) {
                console.error('Erro ao remover card-reordering:', e)
              }
            }, 250)
          }
        } catch (error) {
          console.error('Erro ao processar card:', error)
        }
      })
    } catch (error) {
      console.error('Erro em animateNearbyCards:', error)
    }
  }

  // 3. Adicionar ripple effect ao soltar
  const addRippleEffect = (taskId: string) => {
    addClassWithTimeout(`[data-task="${taskId}"]`, 'card-ripple', 600)
  }

  // 4. Adicionar glow ao soltar
  const addDropGlow = (taskId: string) => {
    addClassWithTimeout(`[data-task="${taskId}"]`, 'card-dropped-glow', 600)
  }

  // 5. Animar coluna se expandindo
  const animateColumnExpand = (columnId: string) => {
    addClassWithTimeout(`[data-column="${columnId}"]`, 'column-expanding', 300)
  }

  // 6. Adicionar morphing animation
  const addMorphingAnimation = (taskId: string) => {
    addClassWithTimeout(`[data-task="${taskId}"]`, 'card-morphing', 400)
  }

  // 7. Bounce customizado por prioridade
  const addCustomBounce = (taskId: string, priority: string) => {
    try {
      const card = document.querySelector(`[data-task="${taskId}"]`)
      if (!card) return
      
      const bounceClass = priority === 'alta' ? 'bounce-high' : priority === 'media' ? 'bounce-medium' : 'bounce-low'
      card.classList.add(bounceClass)
      
      setTimeout(() => {
        try {
          if (card && card.parentElement) {
            card.classList.remove('bounce-high', 'bounce-medium', 'bounce-low')
          }
        } catch (e) {
          console.error('Erro ao remover bounce:', e)
        }
      }, 600)
    } catch (error) {
      console.error('Erro em addCustomBounce:', error)
    }
  }

  // 8. Mostrar indicador de posição
  const showPositionIndicator = (position: 'above' | 'below', taskId: string) => {
    try {
      const card = document.querySelector(`[data-task="${taskId}"]`)
      if (!card) return

      const indicator = document.createElement('div')
      indicator.className = 'position-indicator'
      indicator.setAttribute('data-indicator', 'true')

      if (position === 'above') {
        card.parentElement?.insertBefore(indicator, card)
      } else {
        card.parentElement?.insertBefore(indicator, card.nextSibling)
      }
      
      setTimeout(() => {
        try {
          if (indicator && indicator.parentElement) {
            indicator.remove()
          }
        } catch (e) {
          console.error('Erro ao remover indicador:', e)
        }
      }, 200)
    } catch (error) {
      console.error('Erro em showPositionIndicator:', error)
    }
  }

  // 9. Animar parallax effect
  const addParallaxEffect = (taskId: string, offsetX: number, offsetY: number) => {
    try {
      const card = document.querySelector(`[data-task="${taskId}"]`) as HTMLElement
      if (!card) return
      
      card.style.setProperty('--parallax-x', `${offsetX}px`)
      card.style.setProperty('--parallax-y', `${offsetY}px`)
      card.classList.add('card-parallax')

      setTimeout(() => {
        try {
          if (card && card.parentElement) {
            card.classList.remove('card-parallax')
            card.style.removeProperty('--parallax-x')
            card.style.removeProperty('--parallax-y')
          }
        } catch (e) {
          console.error('Erro ao remover parallax:', e)
        }
      }, 300)
    } catch (error) {
      console.error('Erro em addParallaxEffect:', error)
    }
  }

  // 10. Stagger animation para múltiplos cards
  const addStaggerAnimation = (taskIds: string[], animationClass: string) => {
    try {
      taskIds.forEach((id, index) => {
        try {
          const card = document.querySelector(`[data-task="${id}"]`)
          if (card) {
            card.classList.add(animationClass, `stagger-${Math.min(index + 1, 5)}`)
            
            setTimeout(() => {
              try {
                if (card && card.parentElement) {
                  card.classList.remove(animationClass, `stagger-${Math.min(index + 1, 5)}`)
                }
              } catch (e) {
                console.error('Erro ao remover stagger:', e)
              }
            }, 400 + (index * 100))
          }
        } catch (error) {
          console.error(`Erro ao processar task ${id}:`, error)
        }
      })
    } catch (error) {
      console.error('Erro em addStaggerAnimation:', error)
    }
  }

  // 11. Mostrar indicador de sincronização
  const showSyncIndicator = (taskId: string) => {
    syncingTasks.value.add(taskId)
  }

  // 12. Esconder indicador de sincronização
  const hideSyncIndicator = (taskId: string) => {
    syncingTasks.value.delete(taskId)
  }

  // 13. Verificar se está sincronizando
  const isSyncing = (taskId: string) => {
    return syncingTasks.value.has(taskId)
  }

  // 14. Transição suave entre estados
  const transitionToState = (taskId: string, state: 'idle' | 'dragging' | 'entering' | 'settling') => {
    const card = document.querySelector(`[data-task="${taskId}"]`)
    if (card) {
      card.classList.remove('state-idle', 'state-dragging', 'state-entering', 'state-settling')
      card.classList.add(`state-${state}`)
    }
  }

  // 15. Executar sequência completa de transição
  const executeFullTransition = async (
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    priority: string
  ) => {
    try {
      showSyncIndicator(taskId)
      animateNearbyCards(fromColumnId, taskId)
      animateColumnReceiving(toColumnId)
      animateColumnExpand(toColumnId)

      await new Promise(resolve => setTimeout(resolve, 300))

      addMorphingAnimation(taskId)

      await new Promise(resolve => setTimeout(resolve, 400))

      addCustomBounce(taskId, priority)
      addRippleEffect(taskId)
      addDropGlow(taskId)

      await new Promise(resolve => setTimeout(resolve, 600))

      hideSyncIndicator(taskId)
    } catch (error) {
      console.error('Erro na transição:', error)
      hideSyncIndicator(taskId)
    }
  }

  return {
    animateColumnReceiving,
    animateNearbyCards,
    addRippleEffect,
    addDropGlow,
    animateColumnExpand,
    addMorphingAnimation,
    addCustomBounce,
    showPositionIndicator,
    addParallaxEffect,
    addStaggerAnimation,
    showSyncIndicator,
    hideSyncIndicator,
    isSyncing,
    transitionToState,
    executeFullTransition,
    syncingTasks
  }
}
