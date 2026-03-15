import { ref } from 'vue'
import type { Task } from './useTasks'

export const useAdvancedTransitions = () => {
  const syncingTasks = ref<Set<string>>(new Set())

  // 1. Animar coluna receptora
  const animateColumnReceiving = (columnId: string) => {
    console.log(`🎬 [COLUMN_RECEIVING] Iniciando para coluna: ${columnId}`)
    
    try {
      const column = document.querySelector(`[data-column="${columnId}"]`)
      if (!column) {
        console.warn(`⚠️ [COLUMN_RECEIVING] Coluna não encontrada: ${columnId}`)
        return
      }
      
      column.classList.add('column-receiving')
      console.log(`✅ [COLUMN_RECEIVING] Classe adicionada`)
      
      const timeoutId = setTimeout(() => {
        try {
          if (column && column.parentElement) {
            column.classList.remove('column-receiving')
            console.log(`✅ [COLUMN_RECEIVING] Classe removida`)
          }
        } catch (e) {
          console.error('❌ [COLUMN_RECEIVING] Erro ao remover:', e)
        }
      }, 600)
      
      column.addEventListener('error', () => {
        clearTimeout(timeoutId)
        column.classList.remove('column-receiving')
      }, { once: true })
    } catch (error) {
      console.error(`❌ [COLUMN_RECEIVING] Erro:`, error)
    }
  }

  // 2. Animar cards vizinhos
  const animateNearbyCards = (columnId: string, excludeTaskId: string) => {
    console.log(`🎬 [NEARBY_CARDS] Animando cards próximos na coluna: ${columnId}`)
    
    try {
      const cards = document.querySelectorAll(`[data-column="${columnId}"] [data-task]`)
      if (cards.length === 0) {
        console.warn(`⚠️ [NEARBY_CARDS] Nenhum card encontrado na coluna: ${columnId}`)
        return
      }
      
      cards.forEach((card, index) => {
        try {
          if (card.getAttribute('data-task') !== excludeTaskId) {
            card.classList.add('card-reordering')
            const element = card as HTMLElement
            element.style.animationDelay = `${index * 50}ms`
            
            const timeoutId = setTimeout(() => {
              try {
                if (card && card.parentElement) {
                  card.classList.remove('card-reordering')
                }
              } catch (e) {
                console.error('❌ [NEARBY_CARDS] Erro ao remover:', e)
              }
            }, 250)
            
            card.addEventListener('error', () => {
              clearTimeout(timeoutId)
              card.classList.remove('card-reordering')
            }, { once: true })
          }
        } catch (error) {
          console.error('❌ [NEARBY_CARDS] Erro ao processar card:', error)
        }
      })
      
      console.log(`✅ [NEARBY_CARDS] Concluído`)
    } catch (error) {
      console.error(`❌ [NEARBY_CARDS] Erro:`, error)
    }
  }

  // 3. Adicionar ripple effect ao soltar
  const addRippleEffect = (taskId: string) => {
    console.log(`🌊 [RIPPLE] Iniciando para task: ${taskId}`)
    
    try {
      const card = document.querySelector(`[data-task="${taskId}"]`)
      if (!card) {
        console.warn(`⚠️ [RIPPLE] Card não encontrado: ${taskId}`)
        return
      }
      
      card.classList.add('card-ripple')
      console.log(`✅ [RIPPLE] Classe adicionada`)
      
      const timeoutId = setTimeout(() => {
        try {
          if (card && card.parentElement) {
            card.classList.remove('card-ripple')
            console.log(`✅ [RIPPLE] Classe removida`)
          }
        } catch (e) {
          console.error('❌ [RIPPLE] Erro ao remover:', e)
        }
      }, 600)
      
      card.addEventListener('error', () => {
        clearTimeout(timeoutId)
        card.classList.remove('card-ripple')
      }, { once: true })
    } catch (error) {
      console.error(`❌ [RIPPLE] Erro:`, error)
    }
  }

  // 4. Adicionar glow ao soltar
  const addDropGlow = (taskId: string) => {
    console.log(`✨ [DROP_GLOW] Iniciando para task: ${taskId}`)
    
    try {
      const card = document.querySelector(`[data-task="${taskId}"]`)
      if (!card) {
        console.warn(`⚠️ [DROP_GLOW] Card não encontrado: ${taskId}`)
        return
      }
      
      card.classList.add('card-dropped-glow')
      console.log(`✅ [DROP_GLOW] Classe adicionada`)
      
      const timeoutId = setTimeout(() => {
        try {
          if (card && card.parentElement) {
            card.classList.remove('card-dropped-glow')
            console.log(`✅ [DROP_GLOW] Classe removida`)
          }
        } catch (e) {
          console.error('❌ [DROP_GLOW] Erro ao remover:', e)
        }
      }, 600)
      
      card.addEventListener('error', () => {
        clearTimeout(timeoutId)
        card.classList.remove('card-dropped-glow')
      }, { once: true })
    } catch (error) {
      console.error(`❌ [DROP_GLOW] Erro:`, error)
    }
  }

  // 5. Animar coluna se expandindo
  const animateColumnExpand = (columnId: string) => {
    console.log(`📏 [COLUMN_EXPAND] Iniciando para coluna: ${columnId}`)
    
    try {
      const column = document.querySelector(`[data-column="${columnId}"]`)
      if (!column) {
        console.warn(`⚠️ [COLUMN_EXPAND] Coluna não encontrada: ${columnId}`)
        return
      }
      
      column.classList.add('column-expanding')
      console.log(`✅ [COLUMN_EXPAND] Classe adicionada`)
      
      const timeoutId = setTimeout(() => {
        try {
          if (column && column.parentElement) {
            column.classList.remove('column-expanding')
            console.log(`✅ [COLUMN_EXPAND] Classe removida`)
          }
        } catch (e) {
          console.error('❌ [COLUMN_EXPAND] Erro ao remover:', e)
        }
      }, 300)
      
      column.addEventListener('error', () => {
        clearTimeout(timeoutId)
        column.classList.remove('column-expanding')
      }, { once: true })
    } catch (error) {
      console.error(`❌ [COLUMN_EXPAND] Erro:`, error)
    }
  }

  // 6. Adicionar morphing animation
  const addMorphingAnimation = (taskId: string) => {
    console.log(`🔄 [MORPHING] Iniciando para task: ${taskId}`)
    
    try {
      const card = document.querySelector(`[data-task="${taskId}"]`)
      if (!card) {
        console.warn(`⚠️ [MORPHING] Card não encontrado: ${taskId}`)
        return
      }
      
      card.classList.add('card-morphing')
      console.log(`✅ [MORPHING] Classe adicionada`)
      
      const timeoutId = setTimeout(() => {
        try {
          if (card && card.parentElement) {
            card.classList.remove('card-morphing')
            console.log(`✅ [MORPHING] Classe removida`)
          }
        } catch (e) {
          console.error('❌ [MORPHING] Erro ao remover:', e)
        }
      }, 400)
      
      card.addEventListener('error', () => {
        clearTimeout(timeoutId)
        card.classList.remove('card-morphing')
      }, { once: true })
    } catch (error) {
      console.error(`❌ [MORPHING] Erro:`, error)
    }
  }

  // 7. Bounce customizado por prioridade
  const addCustomBounce = (taskId: string, priority: string) => {
    console.log(`🎾 [BOUNCE] Iniciando para task: ${taskId}, prioridade: ${priority}`)
    
    try {
      const card = document.querySelector(`[data-task="${taskId}"]`)
      if (!card) {
        console.warn(`⚠️ [BOUNCE] Card não encontrado: ${taskId}`)
        return
      }
      
      if (priority === 'alta') {
        card.classList.add('bounce-high')
      } else if (priority === 'media') {
        card.classList.add('bounce-medium')
      } else {
        card.classList.add('bounce-low')
      }

      console.log(`✅ [BOUNCE] Classe adicionada`)
      
      const timeoutId = setTimeout(() => {
        try {
          if (card && card.parentElement) {
            card.classList.remove('bounce-high', 'bounce-medium', 'bounce-low')
            console.log(`✅ [BOUNCE] Classe removida`)
          }
        } catch (e) {
          console.error('❌ [BOUNCE] Erro ao remover:', e)
        }
      }, 600)
      
      card.addEventListener('error', () => {
        clearTimeout(timeoutId)
        card.classList.remove('bounce-high', 'bounce-medium', 'bounce-low')
      }, { once: true })
    } catch (error) {
      console.error(`❌ [BOUNCE] Erro:`, error)
    }
  }

  // 8. Mostrar indicador de posição
  const showPositionIndicator = (position: 'above' | 'below', taskId: string) => {
    console.log(`📍 [POSITION] Mostrando indicador ${position} para task: ${taskId}`)
    
    try {
      const card = document.querySelector(`[data-task="${taskId}"]`)
      if (!card) {
        console.warn(`⚠️ [POSITION] Card não encontrado: ${taskId}`)
        return
      }

      const indicator = document.createElement('div')
      indicator.className = 'position-indicator'
      indicator.setAttribute('data-indicator', 'true')

      if (position === 'above') {
        card.parentElement?.insertBefore(indicator, card)
      } else {
        card.parentElement?.insertBefore(indicator, card.nextSibling)
      }

      console.log(`✅ [POSITION] Indicador criado`)
      
      const timeoutId = setTimeout(() => {
        try {
          if (indicator && indicator.parentElement) {
            indicator.remove()
            console.log(`✅ [POSITION] Indicador removido`)
          }
        } catch (e) {
          console.error('❌ [POSITION] Erro ao remover:', e)
        }
      }, 200)
      
      indicator.addEventListener('error', () => {
        clearTimeout(timeoutId)
        if (indicator.parentElement) {
          indicator.remove()
        }
      }, { once: true })
    } catch (error) {
      console.error(`❌ [POSITION] Erro:`, error)
    }
  }

  // 9. Animar parallax effect
  const addParallaxEffect = (taskId: string, offsetX: number, offsetY: number) => {
    console.log(`🎨 [PARALLAX] Iniciando para task: ${taskId}, offset: (${offsetX}, ${offsetY})`)
    
    try {
      const card = document.querySelector(`[data-task="${taskId}"]`)
      if (!card) {
        console.warn(`⚠️ [PARALLAX] Card não encontrado: ${taskId}`)
        return
      }
      
      const element = card as HTMLElement
      element.style.setProperty('--parallax-x', `${offsetX}px`)
      element.style.setProperty('--parallax-y', `${offsetY}px`)
      element.classList.add('card-parallax')

      console.log(`✅ [PARALLAX] Classe adicionada`)
      
      const timeoutId = setTimeout(() => {
        try {
          if (element && element.parentElement) {
            element.classList.remove('card-parallax')
            element.style.removeProperty('--parallax-x')
            element.style.removeProperty('--parallax-y')
            console.log(`✅ [PARALLAX] Classe removida`)
          }
        } catch (e) {
          console.error('❌ [PARALLAX] Erro ao remover:', e)
        }
      }, 300)
      
      element.addEventListener('error', () => {
        clearTimeout(timeoutId)
        element.classList.remove('card-parallax')
        element.style.removeProperty('--parallax-x')
        element.style.removeProperty('--parallax-y')
      }, { once: true })
    } catch (error) {
      console.error(`❌ [PARALLAX] Erro:`, error)
    }
  }

  // 10. Stagger animation para múltiplos cards
  const addStaggerAnimation = (taskIds: string[], animationClass: string) => {
    console.log(`⏱️ [STAGGER] Iniciando para ${taskIds.length} tasks`)
    
    try {
      taskIds.forEach((id, index) => {
        try {
          const card = document.querySelector(`[data-task="${id}"]`)
          if (card) {
            card.classList.add(animationClass, `stagger-${Math.min(index + 1, 5)}`)
            
            const timeoutId = setTimeout(() => {
              try {
                if (card && card.parentElement) {
                  card.classList.remove(animationClass, `stagger-${Math.min(index + 1, 5)}`)
                }
              } catch (e) {
                console.error('❌ [STAGGER] Erro ao remover:', e)
              }
            }, 400 + (index * 100))
            
            card.addEventListener('error', () => {
              clearTimeout(timeoutId)
              card.classList.remove(animationClass, `stagger-${Math.min(index + 1, 5)}`)
            }, { once: true })
          }
        } catch (error) {
          console.error(`❌ [STAGGER] Erro ao processar task ${id}:`, error)
        }
      })
      
      console.log(`✅ [STAGGER] Concluído`)
    } catch (error) {
      console.error(`❌ [STAGGER] Erro:`, error)
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
      // Remover estados anteriores
      card.classList.remove('state-idle', 'state-dragging', 'state-entering', 'state-settling')
      // Adicionar novo estado
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
      // 1. Mostrar sync
      showSyncIndicator(taskId)

      // 2. Animar coluna de origem
      animateNearbyCards(fromColumnId, taskId)

      // 3. Animar coluna de destino
      animateColumnReceiving(toColumnId)
      animateColumnExpand(toColumnId)

      // 4. Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 300))

      // 5. Adicionar morphing
      addMorphingAnimation(taskId)

      // 6. Aguardar entrada
      await new Promise(resolve => setTimeout(resolve, 400))

      // 7. Adicionar bounce customizado
      addCustomBounce(taskId, priority)

      // 8. Adicionar ripple
      addRippleEffect(taskId)

      // 9. Adicionar glow
      addDropGlow(taskId)

      // 10. Aguardar conclusão
      await new Promise(resolve => setTimeout(resolve, 600))

      // 11. Esconder sync
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
