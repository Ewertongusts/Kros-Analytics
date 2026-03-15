# Análise de Bugs e Debug - Transições e Animações

## 🐛 Bugs Potenciais Identificados

### 1. **Memory Leaks em Partículas**
**Severidade:** 🔴 Alta
**Localização:** `useNextLevelTransitions.ts` - `createParticleBurst()`

**Problema:**
```typescript
// ❌ PROBLEMA: Partículas podem não ser removidas se houver erro
particles.value.push(particle)
setTimeout(() => {
  particle.remove()
  particles.value = particles.value.filter(p => p !== particle)
}, 600)
```

**Solução:**
```typescript
// ✅ CORRETO: Usar try-catch e cleanup
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
      
      const timeoutId = setTimeout(() => {
        try {
          particle.remove()
          particles.value = particles.value.filter(p => p !== particle)
        } catch (e) {
          console.error('Erro ao remover partícula:', e)
        }
      }, 600)
      
      // Cleanup em caso de erro
      particle.addEventListener('error', () => {
        clearTimeout(timeoutId)
        particle.remove()
      })
    } catch (error) {
      console.error('Erro ao criar partícula:', error)
    }
  }
}
```

### 2. **Race Condition em Drop**
**Severidade:** 🔴 Alta
**Localização:** `tarefas.vue` - `handleTaskDropWithPosition()`

**Problema:**
```typescript
// ❌ PROBLEMA: Múltiplos drops simultâneos podem causar conflito
if (fromColumnId !== targetColumnId) {
  await executeFullTransition(...)
  handleDrop(e, targetColumnId, moveTask)
  startExiting(...)
}
```

**Solução:**
```typescript
// ✅ CORRETO: Usar flag para evitar múltiplos drops
const isProcessingDrop = ref(false)

const handleTaskDropWithPosition = async (e: DragEvent, targetColumnId: string) => {
  if (isProcessingDrop.value) {
    console.warn('⚠️ Drop já em processamento')
    return
  }
  
  isProcessingDrop.value = true
  
  try {
    const draggedTaskData = e.dataTransfer?.getData('application/json')
    if (!draggedTaskData) {
      handleDrop(e, targetColumnId, moveTask)
      return
    }

    const task = JSON.parse(draggedTaskData)
    const fromColumnId = task.column_id
    
    if (fromColumnId !== targetColumnId) {
      await executeFullTransition(task.id, fromColumnId, targetColumnId, task.priority || 'media')
      handleDrop(e, targetColumnId, moveTask)
      startExiting(task.id, fromColumnId)
      
      setTimeout(() => {
        startEntering(task.id, targetColumnId)
        setTimeout(() => {
          startSettling(task.id, targetColumnId)
        }, 400)
      }, 300)
    } else {
      handleDrop(e, targetColumnId, moveTask)
    }
  } catch (error) {
    console.error('Erro ao fazer drop:', error)
    handleDrop(e, targetColumnId, moveTask)
  } finally {
    isProcessingDrop.value = false
  }
}
```

### 3. **Null Reference em Seletores DOM**
**Severidade:** 🟡 Média
**Localização:** Todos os composables de transição

**Problema:**
```typescript
// ❌ PROBLEMA: Elemento pode não existir
const card = document.querySelector(`[data-task="${taskId}"]`)
card.classList.add('liquid-swipe') // Erro se card for null
```

**Solução:**
```typescript
// ✅ CORRETO: Verificar antes de usar
const addLiquidSwipe = (taskId: string) => {
  const card = document.querySelector(`[data-task="${taskId}"]`)
  if (!card) {
    console.warn(`⚠️ Card não encontrado: ${taskId}`)
    return
  }
  
  try {
    card.classList.add('liquid-swipe')
    setTimeout(() => {
      if (card && card.parentElement) {
        card.classList.remove('liquid-swipe')
      }
    }, 600)
  } catch (error) {
    console.error('Erro ao adicionar liquid-swipe:', error)
  }
}
```

### 4. **Animações Não Limpas**
**Severidade:** 🟡 Média
**Localização:** Todos os composables

**Problema:**
```typescript
// ❌ PROBLEMA: Classes não são removidas se houver erro
card.classList.add('animation-class')
setTimeout(() => {
  card.classList.remove('animation-class')
}, 600)
// Se houver erro, classe fica aplicada
```

**Solução:**
```typescript
// ✅ CORRETO: Usar AbortController para cleanup
const addAnimation = (taskId: string, animationClass: string, duration: number = 600) => {
  const card = document.querySelector(`[data-task="${taskId}"]`)
  if (!card) return
  
  const controller = new AbortController()
  
  try {
    card.classList.add(animationClass)
    
    const timeoutId = setTimeout(() => {
      try {
        card.classList.remove(animationClass)
      } catch (e) {
        console.error('Erro ao remover animação:', e)
      }
    }, duration)
    
    // Cleanup em caso de erro
    return () => {
      clearTimeout(timeoutId)
      card.classList.remove(animationClass)
      controller.abort()
    }
  } catch (error) {
    console.error('Erro ao adicionar animação:', error)
    return () => {}
  }
}
```

### 5. **Magnetic Attraction Performance**
**Severidade:** 🟡 Média
**Localização:** `useNextLevelTransitions.ts` - `enableMagneticAttraction()`

**Problema:**
```typescript
// ❌ PROBLEMA: Executa em cada mousemove (60+ vezes/segundo)
document.addEventListener('mousemove', (e) => {
  enableMagneticAttraction(e) // Muito pesado!
})
```

**Solução:**
```typescript
// ✅ CORRETO: Usar throttle/debounce
const enableMagneticAttractionOptimized = () => {
  let lastTime = 0
  const throttleDelay = 16 // ~60fps
  
  document.addEventListener('mousemove', (e) => {
    const now = Date.now()
    if (now - lastTime < throttleDelay) return
    
    lastTime = now
    enableMagneticAttraction(e)
  })
}
```

### 6. **Collision Detection Performance**
**Severidade:** 🟡 Média
**Localização:** `useNextLevelTransitions.ts` - `detectCollision()`

**Problema:**
```typescript
// ❌ PROBLEMA: O(n²) complexity - muito lento com muitos cards
cards.forEach(card1 => {
  cards.forEach(card2 => {
    if (detectCollision(card1, card2)) {
      resolveCollision(card1, card2)
    }
  })
})
```

**Solução:**
```typescript
// ✅ CORRETO: Usar spatial partitioning ou limitar a busca
const detectCollisionsOptimized = (cards: Element[]) => {
  const gridSize = 200
  const grid = new Map<string, Element[]>()
  
  // Agrupar cards por grid
  cards.forEach(card => {
    const rect = card.getBoundingClientRect()
    const gridKey = `${Math.floor(rect.left / gridSize)},${Math.floor(rect.top / gridSize)}`
    if (!grid.has(gridKey)) grid.set(gridKey, [])
    grid.get(gridKey)!.push(card)
  })
  
  // Verificar apenas cards próximos
  grid.forEach(nearbyCards => {
    for (let i = 0; i < nearbyCards.length; i++) {
      for (let j = i + 1; j < nearbyCards.length; j++) {
        if (detectCollision(nearbyCards[i], nearbyCards[j])) {
          resolveCollision(nearbyCards[i], nearbyCards[j])
        }
      }
    }
  })
}
```

### 7. **Scroll Snap Infinite Loop**
**Severidade:** 🟡 Média
**Localização:** `useNextLevelTransitions.ts` - `enableSmoothScrollSnap()`

**Problema:**
```typescript
// ❌ PROBLEMA: Pode causar loop infinito
container.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    closest?.scrollIntoView({ behavior: 'smooth' })
    // scrollIntoView dispara scroll event novamente!
  }, 150)
})
```

**Solução:**
```typescript
// ✅ CORRETO: Usar flag para evitar loop
const enableSmoothScrollSnapOptimized = (container: HTMLElement) => {
  let scrollTimeout: ReturnType<typeof setTimeout>
  let isScrolling = false
  
  container.addEventListener('scroll', () => {
    if (isScrolling) return
    
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      const cards = container.querySelectorAll('[data-task]')
      let closest = cards[0]
      let closestDistance = Infinity
      
      cards.forEach(card => {
        const distance = Math.abs(card.getBoundingClientRect().left - container.getBoundingClientRect().left)
        if (distance < closestDistance) {
          closestDistance = distance
          closest = card
        }
      })
      
      if (closest && closestDistance > 10) {
        isScrolling = true
        closest.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        setTimeout(() => {
          isScrolling = false
        }, 500)
      }
    }, 150)
  })
}
```

### 8. **Data Attributes Não Encontrados**
**Severidade:** 🟡 Média
**Localização:** `tarefas.vue` - Template

**Problema:**
```vue
<!-- ❌ PROBLEMA: data-task pode não estar no elemento correto -->
<TasksKTaskCard :data-task="task.id" />
<!-- Atributo é passado como prop, não como data-attribute -->
```

**Solução:**
```vue
<!-- ✅ CORRETO: Usar v-bind:data-* ou :data-* -->
<TasksKTaskCard 
  :key="task.id"
  :data-task="task.id"
  :task="task"
/>

<!-- Ou no componente filho -->
<div :data-task="task.id" class="card">
  <!-- conteúdo -->
</div>
```

### 9. **Async/Await Sem Tratamento de Erro**
**Severidade:** 🟡 Média
**Localização:** `tarefas.vue` - `handleTaskDropWithPosition()`

**Problema:**
```typescript
// ❌ PROBLEMA: Erro não tratado pode quebrar a aplicação
await executeFullTransition(...)
handleDrop(e, targetColumnId, moveTask)
```

**Solução:**
```typescript
// ✅ CORRETO: Usar try-catch
try {
  await executeFullTransition(...)
  handleDrop(e, targetColumnId, moveTask)
} catch (error) {
  console.error('Erro na transição:', error)
  // Fallback
  handleDrop(e, targetColumnId, moveTask)
}
```

### 10. **Floating Animation Infinita**
**Severidade:** 🟢 Baixa
**Localização:** `kanban-transitions.css` - `.floating`

**Problema:**
```css
/* ❌ PROBLEMA: Animação infinita consome recursos */
.floating {
  animation: float 3s ease-in-out infinite;
}
```

**Solução:**
```css
/* ✅ CORRETO: Usar apenas quando necessário */
.floating {
  animation: float 3s ease-in-out infinite;
}

/* Remover quando não está em uso */
.floating.idle {
  animation: none;
}
```

## 🔍 Debug Checklist

### Antes de Implementar
- [ ] Verificar se todos os data-attributes estão corretos
- [ ] Testar com 0 cards
- [ ] Testar com 1 card
- [ ] Testar com 100+ cards
- [ ] Testar com múltiplos drops simultâneos

### Durante a Implementação
- [ ] Adicionar console.log em pontos críticos
- [ ] Verificar DevTools Console para erros
- [ ] Verificar DevTools Performance
- [ ] Verificar DevTools Memory
- [ ] Testar em diferentes navegadores

### Após a Implementação
- [ ] Verificar memory leaks
- [ ] Verificar performance
- [ ] Verificar acessibilidade
- [ ] Verificar em mobile
- [ ] Testar com undo/redo

## 📊 Debug Logging

### Adicionar Logs Estratégicos

```typescript
// Em useAdvancedTransitions.ts
const addLiquidSwipe = (taskId: string) => {
  console.log(`🎬 [LIQUID_SWIPE] Iniciando para task: ${taskId}`)
  
  const card = document.querySelector(`[data-task="${taskId}"]`)
  if (!card) {
    console.warn(`⚠️ [LIQUID_SWIPE] Card não encontrado: ${taskId}`)
    return
  }
  
  try {
    card.classList.add('liquid-swipe')
    console.log(`✅ [LIQUID_SWIPE] Classe adicionada`)
    
    setTimeout(() => {
      card.classList.remove('liquid-swipe')
      console.log(`✅ [LIQUID_SWIPE] Classe removida`)
    }, 600)
  } catch (error) {
    console.error(`❌ [LIQUID_SWIPE] Erro:`, error)
  }
}

// Em tarefas.vue
const handleTaskDropWithPosition = async (e: DragEvent, targetColumnId: string) => {
  console.log(`🎯 [DROP] Iniciando drop para coluna: ${targetColumnId}`)
  
  try {
    const draggedTaskData = e.dataTransfer?.getData('application/json')
    if (!draggedTaskData) {
      console.warn(`⚠️ [DROP] Sem dados de drag`)
      return
    }

    const task = JSON.parse(draggedTaskData)
    console.log(`📦 [DROP] Task: ${task.id}, De: ${task.column_id}, Para: ${targetColumnId}`)
    
    if (task.column_id !== targetColumnId) {
      console.log(`🔄 [DROP] Mudando de coluna`)
      await executeFullTransition(task.id, task.column_id, targetColumnId, task.priority)
      console.log(`✅ [DROP] Transição completa`)
    }
  } catch (error) {
    console.error(`❌ [DROP] Erro:`, error)
  }
}
```

## 🧪 Testes Recomendados

### Teste 1: Memory Leak
```javascript
// No DevTools Console
let initialMemory = performance.memory.usedJSHeapSize
// Fazer 100 drops
// Verificar se memory cresceu muito
let finalMemory = performance.memory.usedJSHeapSize
console.log(`Memory delta: ${(finalMemory - initialMemory) / 1024 / 1024}MB`)
```

### Teste 2: Performance
```javascript
// No DevTools Console
performance.mark('drop-start')
// Fazer drop
performance.mark('drop-end')
performance.measure('drop', 'drop-start', 'drop-end')
console.log(performance.getEntriesByName('drop')[0])
```

### Teste 3: Race Condition
```javascript
// Fazer múltiplos drops simultâneos
const cards = document.querySelectorAll('[data-task]')
cards.forEach((card, i) => {
  setTimeout(() => {
    // Simular drop
  }, i * 10)
})
```

## 📋 Resumo de Correções

| Bug | Severidade | Solução | Tempo |
|-----|-----------|---------|-------|
| Memory Leaks | 🔴 Alta | Try-catch + cleanup | 1h |
| Race Condition | 🔴 Alta | Flag de processamento | 1h |
| Null Reference | 🟡 Média | Verificar antes de usar | 30m |
| Animações Não Limpas | 🟡 Média | AbortController | 1h |
| Performance | 🟡 Média | Throttle/Debounce | 1h |
| Collision Detection | 🟡 Média | Spatial partitioning | 2h |
| Scroll Snap Loop | 🟡 Média | Flag de scroll | 1h |
| Data Attributes | 🟡 Média | Verificar binding | 30m |
| Async Errors | 🟡 Média | Try-catch | 30m |
| Floating Animation | 🟢 Baixa | Remover quando idle | 30m |

**Total:** ~9 horas de correções

