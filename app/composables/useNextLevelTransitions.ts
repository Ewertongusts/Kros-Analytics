import { ref } from 'vue'

export const useNextLevelTransitions = () => {
  const particles = ref<HTMLElement[]>([])
  const MAX_PARTICLES = 100
  
  // Cleanup periódico de partículas removidas do DOM
  const cleanupParticles = () => {
    particles.value = particles.value.filter(p => document.body.contains(p))
    
    // Se exceder limite, remover as mais antigas
    if (particles.value.length > MAX_PARTICLES) {
      const excess = particles.value.length - MAX_PARTICLES
      particles.value.slice(0, excess).forEach(p => {
        try { p.remove() } catch (e) {}
      })
      particles.value = particles.value.slice(excess)
    }
  }
  
  // Executar cleanup a cada 2 segundos
  const cleanupInterval = setInterval(cleanupParticles, 2000)
  
  // Função para parar o cleanup (para onUnmounted)
  const stopCleanup = () => {
    clearInterval(cleanupInterval)
  }

  // 1. Liquid Swipe Animation
  const addLiquidSwipe = (taskId: string) => {
    const card = document.querySelector(`[data-task="${taskId}"]`)
    if (!card) return
    
    try {
      card.classList.add('liquid-swipe')
      
      setTimeout(() => {
        try {
          if (card && card.parentElement) {
            card.classList.remove('liquid-swipe')
          }
        } catch (e) {
          console.error('❌ [LIQUID_SWIPE]:', e)
        }
      }, 600)
    } catch (error) {
      console.error(`❌ [LIQUID_SWIPE]:`, error)
    }
  }

  // 2. Elastic Snap
  const addElasticSnap = (taskId: string) => {
    const card = document.querySelector(`[data-task="${taskId}"]`)
    if (!card) return
    
    try {
      card.classList.add('elastic-snap')
      
      setTimeout(() => {
        try {
          if (card && card.parentElement) {
            card.classList.remove('elastic-snap')
          }
        } catch (e) {
          console.error('❌ [ELASTIC_SNAP]:', e)
        }
      }, 600)
    } catch (error) {
      console.error(`❌ [ELASTIC_SNAP]:`, error)
    }
  }

  // 3. Stagger Wave Effect (FIXED: Closure problem)
  const createWaveEffect = (columnId: string, startIndex: number) => {
    const cards = document.querySelectorAll(`[data-column="${columnId}"] [data-task]`)
    if (cards.length === 0) return
    
    try {
      // Usar IIFE para criar novo escopo em cada iteração
      cards.forEach((card, index) => {
        (() => {
          const delay = Math.abs(index - startIndex) * 50
          const element = card as HTMLElement
          element.style.animationDelay = `${delay}ms`
          element.classList.add('wave-animation')
          
          const totalDuration = 300 + (cards.length * 50)
          const timeoutId = setTimeout(() => {
            try {
              if (element && element.parentElement) {
                element.classList.remove('wave-animation')
                element.style.animationDelay = '0ms'
              }
            } catch (e) {
              console.error('❌ [WAVE]:', e)
            }
          }, totalDuration)
        })()
      })
    } catch (error) {
      console.error(`❌ [WAVE]:`, error)
    }
  }

  // 4. Magnetic Attraction Effect (REMOVED: Código morto)
  // Função removida - nunca era chamada

  // Throttled version for mousemove events (REMOVED: Código morto)
  // Função removida - nunca era chamada

  // 5. Flip Animation 3D
  const addFlip3D = (taskId: string) => {
    const card = document.querySelector(`[data-task="${taskId}"]`)
    if (!card) return
    
    try {
      card.classList.add('flip-3d')
      
      setTimeout(() => {
        try {
          if (card && card.parentElement) {
            card.classList.remove('flip-3d')
          }
        } catch (e) {
          console.error('❌ [FLIP_3D]:', e)
        }
      }, 600)
    } catch (error) {
      console.error(`❌ [FLIP_3D]:`, error)
    }
  }

  // 6. Blur Motion Effect
  const addBlurMotion = (taskId: string) => {
    const card = document.querySelector(`[data-task="${taskId}"]`)
    if (!card) return
    
    try {
      card.classList.add('blur-motion')
      
      setTimeout(() => {
        try {
          if (card && card.parentElement) {
            card.classList.remove('blur-motion')
          }
        } catch (e) {
          console.error('❌ [BLUR_MOTION]:', e)
        }
      }, 600)
    } catch (error) {
      console.error(`❌ [BLUR_MOTION]:`, error)
    }
  }

  // 7. Particle Burst Effect (FIXED: Memory leak prevention)
  const createParticleBurst = (x: number, y: number, count: number = 8, color: string = '#3b82f6') => {
    for (let i = 0; i < count; i++) {
      try {
        const particle = document.createElement('div')
        particle.className = 'particle-burst'
        particle.style.left = x + 'px'
        particle.style.top = y + 'px'
        particle.style.backgroundColor = color
        
        const angle = (i / count) * Math.PI * 2
        const velocity = 5
        const vx = Math.cos(angle) * velocity
        const vy = Math.sin(angle) * velocity
        
        particle.style.setProperty('--vx', `${vx}`)
        particle.style.setProperty('--vy', `${vy}`)
        
        document.body.appendChild(particle)
        particles.value.push(particle)
        
        setTimeout(() => {
          try {
            if (particle && particle.parentElement) {
              particle.remove()
              particles.value = particles.value.filter(p => p !== particle)
            }
          } catch (e) {
            console.error('❌ [PARTICLES]:', e)
            particles.value = particles.value.filter(p => p !== particle)
          }
        }, 600)
      } catch (error) {
        console.error('❌ [PARTICLES]:', error)
      }
    }
  }

  // 8. Collision Detection (REMOVED: Código morto)
  // Funções removidas - nunca eram chamadas

  // 9. Resolve Collision (REMOVED: Código morto)
  // Função removida - nunca era chamada

  // 10. Smooth Scroll Snap (REMOVED: Código morto)
  // Função removida - nunca era chamada

  // 11. Floating Animation (FIXED: Agora com cleanup)
  const addFloating = (taskId: string) => {
    const card = document.querySelector(`[data-task="${taskId}"]`)
    if (!card) return
    
    try {
      card.classList.add('floating')
    } catch (error) {
      console.error(`❌ [FLOATING]:`, error)
    }
  }

  const removeFloating = (taskId: string) => {
    const card = document.querySelector(`[data-task="${taskId}"]`)
    if (!card) return
    
    try {
      card.classList.remove('floating')
    } catch (error) {
      console.error(`❌ [FLOATING]:`, error)
    }
  }

  // 12. Glow Pulse (FIXED: Agora com cleanup)
  const addGlowPulse = (taskId: string) => {
    const card = document.querySelector(`[data-task="${taskId}"]`)
    if (!card) return
    
    try {
      card.classList.add('glow-pulse')
    } catch (error) {
      console.error(`❌ [GLOW_PULSE]:`, error)
    }
  }

  const removeGlowPulse = (taskId: string) => {
    const card = document.querySelector(`[data-task="${taskId}"]`)
    if (!card) return
    
    try {
      card.classList.remove('glow-pulse')
    } catch (error) {
      console.error(`❌ [GLOW_PULSE]:`, error)
    }
  }

  // 13. Shake Animation
  const addShake = (taskId: string) => {
    const card = document.querySelector(`[data-task="${taskId}"]`)
    if (!card) return
    
    try {
      card.classList.add('shake')
      
      setTimeout(() => {
        try {
          if (card && card.parentElement) {
            card.classList.remove('shake')
          }
        } catch (e) {
          console.error('❌ [SHAKE]:', e)
        }
      }, 400)
    } catch (error) {
      console.error(`❌ [SHAKE]:`, error)
    }
  }

  // 14. Skeleton Loading (FIXED: Agora com cleanup)
  const addSkeleton = (taskId: string) => {
    const card = document.querySelector(`[data-task="${taskId}"]`)
    if (!card) return
    
    try {
      card.classList.add('skeleton-loading')
    } catch (error) {
      console.error(`❌ [SKELETON]:`, error)
    }
  }

  const removeSkeleton = (taskId: string) => {
    const card = document.querySelector(`[data-task="${taskId}"]`)
    if (!card) return
    
    try {
      card.classList.remove('skeleton-loading')
    } catch (error) {
      console.error(`❌ [SKELETON]:`, error)
    }
  }

  // 15. Undo/Redo Animation
  const addUndoAnimation = (taskId: string) => {
    const card = document.querySelector(`[data-task="${taskId}"]`)
    if (!card) return
    
    try {
      card.classList.add('undo-reverse')
      
      setTimeout(() => {
        try {
          if (card && card.parentElement) {
            card.classList.remove('undo-reverse')
          }
        } catch (e) {
          console.error('❌ [UNDO]:', e)
        }
      }, 600)
    } catch (error) {
      console.error(`❌ [UNDO]:`, error)
    }
  }

  // 16. Smart Reordering (REMOVED: Código morto)
  // Função removida - nunca era chamada

  // 17. Executar sequência completa de transição next-level
  const executeNextLevelTransition = async (
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    priority: string
  ) => {
    try {
      // 1. Liquid Swipe
      addLiquidSwipe(taskId)
      
      // 2. Blur Motion
      addBlurMotion(taskId)
      
      // 3. Wave Effect na coluna de origem
      try {
        const fromCards = document.querySelectorAll(`[data-column="${fromColumnId}"] [data-task]`)
        const fromIndex = Array.from(fromCards).findIndex(c => c.getAttribute('data-task') === taskId)
        if (fromIndex >= 0) {
          createWaveEffect(fromColumnId, fromIndex)
        }
      } catch (e) {
        console.error('❌ [TRANSITION] Wave origem:', e)
      }
      
      // 4. Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 5. Flip 3D
      addFlip3D(taskId)
      
      // 6. Elastic Snap
      addElasticSnap(taskId)
      
      // 7. Particle Burst
      try {
        const card = document.querySelector(`[data-task="${taskId}"]`)
        if (card) {
          const rect = card.getBoundingClientRect()
          const color = priority === 'alta' ? '#ef4444' : priority === 'media' ? '#f59e0b' : '#3b82f6'
          createParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 8, color)
        }
      } catch (e) {
        console.error('❌ [TRANSITION] Particles:', e)
      }
      
      // 8. Wave Effect na coluna de destino
      try {
        const toCards = document.querySelectorAll(`[data-column="${toColumnId}"] [data-task]`)
        if (toCards.length > 0) {
          createWaveEffect(toColumnId, toCards.length - 1)
        }
      } catch (e) {
        console.error('❌ [TRANSITION] Wave destino:', e)
      }
      
      // 9. Aguardar conclusão
      await new Promise(resolve => setTimeout(resolve, 600))
    } catch (error) {
      console.error('❌ [TRANSITION]:', error)
    }
  }

  return {
    addLiquidSwipe,
    addElasticSnap,
    createWaveEffect,
    addFlip3D,
    addBlurMotion,
    createParticleBurst,
    addFloating,
    removeFloating,
    addGlowPulse,
    removeGlowPulse,
    addShake,
    addSkeleton,
    removeSkeleton,
    addUndoAnimation,
    executeNextLevelTransition,
    particles,
    cleanupParticles,
    stopCleanup
  }
}
