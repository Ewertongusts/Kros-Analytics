# Guia de Implementação - Transições Avançadas

## 🚀 Como Usar o Novo Composable

### 1. Importar o Composable
```typescript
import { useAdvancedTransitions } from '~/composables/useAdvancedTransitions'

const {
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
  executeFullTransition
} = useAdvancedTransitions()
```

### 2. Usar em `tarefas.vue`

```typescript
// Importar
import { useAdvancedTransitions } from '~/composables/useAdvancedTransitions'

// Usar no composable
const advancedTransitions = useAdvancedTransitions()

// Melhorar handleTaskDropWithPosition
const handleTaskDropWithPosition = async (e: DragEvent, targetColumnId: string) => {
  const draggedTaskData = e.dataTransfer?.getData('application/json')
  if (!draggedTaskData) {
    handleDrop(e, targetColumnId, moveTask)
    return
  }

  try {
    const task = JSON.parse(draggedTaskData)
    const fromColumnId = task.column_id
    
    if (fromColumnId !== targetColumnId) {
      // Executar transição completa
      await advancedTransitions.executeFullTransition(
        task.id,
        fromColumnId,
        targetColumnId,
        task.priority
      )
      
      // Fazer o drop
      handleDrop(e, targetColumnId, moveTask)
    } else {
      handleDrop(e, targetColumnId, moveTask)
    }
  } catch (error) {
    console.error('Erro ao fazer drop:', error)
    handleDrop(e, targetColumnId, moveTask)
  }
}
```

### 3. Adicionar Data Attributes ao Template

```vue
<!-- Em tarefas.vue -->
<div 
  v-for="(column, index) in displayColumns"
  :key="column.column_id"
  :data-column="column.column_id"
  class="flex-shrink-0 w-[220px] rounded-xl bg-[#1a1a1c]"
>
  <!-- Cards -->
  <TasksKTaskCard
    v-for="task in getTasksInColumn(column.column_id)"
    :key="task.id"
    :data-task="task.id"
    :task="task"
    <!-- ... outros props ... -->
  />
</div>
```

### 4. Mostrar Indicador de Sincronização

```vue
<!-- Em KTaskCard.vue -->
<div v-if="isSyncing(task.id)" class="absolute top-2 right-2">
  <svg class="w-4 h-4 sync-spinner text-blue-400">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
  </svg>
</div>
```

## 📊 Fluxo Completo de Transição Avançada

```
Usuário arrasta card
         ↓
1. showSyncIndicator() - Mostrar spinner
         ↓
2. animateNearbyCards() - Cards vizinhos se reorganizam
         ↓
3. animateColumnReceiving() - Coluna receptora faz glow
         ↓
4. animateColumnExpand() - Coluna se expande
         ↓
5. addMorphingAnimation() - Card muda de forma
         ↓
6. handleDrop() - Atualiza banco de dados
         ↓
7. addCustomBounce() - Bounce baseado em prioridade
         ↓
8. addRippleEffect() - Onda visual
         ↓
9. addDropGlow() - Glow de confirmação
         ↓
10. hideSyncIndicator() - Esconder spinner
         ↓
Transição completa!
```

## 🎨 Animações Disponíveis

### Coluna
- `animateColumnReceiving()` - Glow na coluna receptora
- `animateColumnExpand()` - Coluna se expande

### Cards Vizinhos
- `animateNearbyCards()` - Cards se reorganizam

### Card Principal
- `addMorphingAnimation()` - Transformação de forma
- `addCustomBounce()` - Bounce customizado por prioridade
- `addRippleEffect()` - Onda ao soltar
- `addDropGlow()` - Glow de confirmação

### Efeitos Especiais
- `showPositionIndicator()` - Indicador de posição
- `addParallaxEffect()` - Efeito parallax
- `addStaggerAnimation()` - Cascata para múltiplos

### Estados
- `transitionToState()` - Transição entre estados
- `showSyncIndicator()` / `hideSyncIndicator()` - Indicador de sync

## 💻 Exemplo Completo

```typescript
// Em tarefas.vue
import { useAdvancedTransitions } from '~/composables/useAdvancedTransitions'

const advancedTransitions = useAdvancedTransitions()

const handleTaskDropWithPosition = async (e: DragEvent, targetColumnId: string) => {
  const draggedTaskData = e.dataTransfer?.getData('application/json')
  if (!draggedTaskData) {
    handleDrop(e, targetColumnId, moveTask)
    return
  }

  try {
    const task = JSON.parse(draggedTaskData)
    const fromColumnId = task.column_id
    
    if (fromColumnId !== targetColumnId) {
      // Executar transição completa com todas as animações
      await advancedTransitions.executeFullTransition(
        task.id,
        fromColumnId,
        targetColumnId,
        task.priority
      )
      
      // Fazer o drop
      handleDrop(e, targetColumnId, moveTask)
      
      // Iniciar transições de entrada/saída
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
  }
}
```

## 🎯 Benefícios

✅ **Feedback Visual Completo** - Usuário vê cada etapa
✅ **Transições Fluidas** - Sem saltos ou mudanças abruptas
✅ **Sincronização Visível** - Indicador de sync
✅ **Animações Customizadas** - Bounce por prioridade
✅ **Performance** - GPU accelerated
✅ **Acessível** - Respeita prefers-reduced-motion

## 📁 Arquivos Criados/Modificados

1. **app/composables/useAdvancedTransitions.ts** (novo)
   - Composable com 15 funções de transição

2. **app/components/tasks/kanban-transitions.css** (atualizado)
   - Adicionadas 12 novas animações

3. **app/pages/tarefas.vue** (a atualizar)
   - Importar composable
   - Usar executeFullTransition()
   - Adicionar data-attributes

4. **app/components/tasks/KTaskCard.vue** (a atualizar)
   - Mostrar indicador de sync
   - Adicionar data-task attribute

## ✅ Checklist de Implementação

- [ ] Importar useAdvancedTransitions em tarefas.vue
- [ ] Adicionar data-column e data-task attributes
- [ ] Atualizar handleTaskDropWithPosition
- [ ] Mostrar indicador de sync em KTaskCard
- [ ] Testar com 1 card
- [ ] Testar com múltiplos cards
- [ ] Testar em diferentes navegadores
- [ ] Testar em mobile
- [ ] Verificar performance
- [ ] Verificar acessibilidade

## 🚀 Próximos Passos

1. **Implementar em tarefas.vue**
   - Usar executeFullTransition()
   - Adicionar data-attributes

2. **Testar em Produção**
   - Verificar performance
   - Coletar feedback

3. **Otimizações**
   - Debounce para múltiplos drops
   - Cache de elementos
   - Lazy loading de animações

## 📊 Métricas de Sucesso

- ✅ Transições duram 1000-1500ms total
- ✅ Sem jank ou stuttering
- ✅ 60 FPS durante animações
- ✅ Sincronizado com Supabase
- ✅ Funciona em todos os navegadores
- ✅ Acessível para todos os usuários

