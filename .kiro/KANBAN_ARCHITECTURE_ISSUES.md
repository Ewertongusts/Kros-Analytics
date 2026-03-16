# Problemas Arquiteturais do Kanban - Se Refizesse do Zero

## 🔴 CRÍTICOS (Refaria Tudo)

### 1. **Drag-Drop State Management - Muito Complexo**
**Problema Atual:**
- Estado de drag espalhado em múltiplos composables (`useTaskDragDrop`, `useRealtimeCardTransitions`, `useAdvancedTransitions`)
- Race conditions constantes entre atualização de dados e re-renderização
- Necessário usar `nextTick()` + timeouts para evitar piscar
- Lógica de drop em 3 lugares diferentes (coluna, card, página)

**Como Refaria:**
```typescript
// Criar um único composable centralizado
export const useKanbanDragDrop = () => {
  // Estados
  const dragState = ref<{
    taskId: string | null
    fromColumnId: string | null
    toColumnId: string | null
    position: 'above' | 'below' | null
    isDragging: boolean
    isDropping: boolean
  }>({...})
  
  // Máquina de estados clara
  const startDrag = (task, column) => { dragState.isDragging = true }
  const moveDrag = (toColumn, position) => { dragState.toColumnId = toColumn }
  const completeDrop = async () => {
    // 1. Mark as exiting
    // 2. await nextTick()
    // 3. Update data
    // 4. Mark as entering
    // 5. Reset state
  }
  const cancelDrag = () => { dragState.isDragging = false }
}
```

**Benefício:** Fluxo linear, sem race conditions, fácil de debugar.

---

### 2. **Transições de Cards - Muito Overhead**
**Problema Atual:**
- 3 composables diferentes para transições (`useRealtimeCardTransitions`, `useAdvancedTransitions`, `useNextLevelTransitions`)
- Partículas, efeitos visuais, animações complexas
- Memory leaks com cleanup intervals
- Muitos estados: `entering`, `exiting`, `settling`, `syncing`

**Como Refaria:**
```typescript
// Apenas 2 estados simples
const cardState = ref<'idle' | 'exiting' | 'entering'>('idle')

// CSS puro para animações
// Sem JavaScript para efeitos visuais
// Sem partículas (overhead desnecessário)
```

**Benefício:** 80% menos código, melhor performance, sem memory leaks.

---

### 3. **Renderização de Cards - Sem Virtualização**
**Problema Atual:**
- Renderiza TODOS os cards mesmo com 500+
- Cada card tem múltiplos event listeners
- Sem otimização de re-renders
- Computed property `getTasksInColumn()` chamada múltiplas vezes

**Como Refaria:**
```typescript
// Usar vue-virtual-scroller desde o início
<VirtualScroller
  :items="getTasksInColumn(column.id)"
  :item-size="120"
  key-field="id"
>
  <template #default="{ item }">
    <KTaskCard :task="item" />
  </template>
</VirtualScroller>
```

**Benefício:** Renderiza apenas ~50 cards visíveis, 10x mais rápido.

---

### 4. **Reordenação Durante Drag - Muito Complexa**
**Problema Atual:**
- `moveTask()` é chamado DURANTE o drag para "abrir espaço"
- Causa múltiplas atualizações de dados
- Difícil de sincronizar com animações
- Pode causar bugs de posição

**Como Refaria:**
```typescript
// Apenas 2 operações:
// 1. Drag: Mostrar preview visual (sem atualizar dados)
// 2. Drop: Atualizar dados UMA VEZ

// Usar CSS transform para reordenar visualmente
// Sem chamar moveTask() durante drag
```

**Benefício:** Menos bugs, mais previsível, melhor performance.

---

## 🟠 ALTOS (Refaria Parcialmente)

### 5. **Composables Muito Grandes**
**Problema:**
- `tarefas.vue` tem 1000+ linhas
- Múltiplas responsabilidades misturadas
- Difícil de testar

**Como Refaria:**
```
composables/
  useKanbanDragDrop.ts (drag-drop centralizado)
  useKanbanData.ts (fetch, CRUD)
  useKanbanColumns.ts (já existe, manter)
  useKanbanSelection.ts (seleção de cards)
  useKanbanFilters.ts (filtros)

pages/
  tarefas.vue (apenas template + orquestração)
```

---

### 6. **Sem Testes Unitários**
**Problema:**
- Impossível testar lógica de drag-drop
- Bugs só aparecem em produção
- Refatorações arriscadas

**Como Refaria:**
```typescript
// Testes para cada composable
describe('useKanbanDragDrop', () => {
  it('should mark card as exiting before updating data', () => {
    // ...
  })
  
  it('should not render card while exiting', () => {
    // ...
  })
})
```

---

### 7. **Sem Type Safety**
**Problema:**
- Muitos `any` types
- Erros em runtime
- Refatorações quebram sem avisar

**Como Refaria:**
```typescript
// Types bem definidos
interface DragState {
  taskId: string
  fromColumnId: string
  toColumnId: string
  position: 'above' | 'below'
}

interface CardTransition {
  taskId: string
  state: 'idle' | 'exiting' | 'entering'
  timestamp: number
}
```

---

## 🟡 MÉDIOS (Melhorias)

### 8. **Sem Feedback Visual Claro**
**Problema:**
- Usuário não sabe se drop foi bem-sucedido
- Sem loading states
- Sem error handling visual

**Como Refaria:**
```vue
<!-- Mostrar estado claro -->
<div v-if="dropState === 'loading'" class="spinner" />
<div v-if="dropState === 'error'" class="error-toast" />
<div v-if="dropState === 'success'" class="success-animation" />
```

---

### 9. **Sem Undo/Redo Funcional**
**Problema:**
- Composable `useTaskHistory` existe mas não funciona bem
- Não sincroniza com drag-drop

**Como Refaria:**
```typescript
// Integrar undo/redo no fluxo de drop
const completeDrop = async () => {
  const previousState = cloneDeep(task)
  await moveTask(...)
  addToHistory({
    action: 'move',
    before: previousState,
    after: task
  })
}
```

---

### 10. **Sem Sincronização em Tempo Real**
**Problema:**
- Se outro usuário move um card, você não vê
- Sem websockets ou polling
- Dados podem ficar desincronizados

**Como Refaria:**
```typescript
// Usar Supabase realtime
const subscription = supabase
  .from('tasks')
  .on('*', payload => {
    if (payload.new.id !== currentDraggedTaskId) {
      updateTask(payload.new)
    }
  })
  .subscribe()
```

---

## 📋 Resumo: Arquitetura Ideal

```
┌─────────────────────────────────────────┐
│         tarefas.vue (Template)          │
│  - Apenas renderização                  │
│  - Orquestração de composables          │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┬──────────────┬──────────────┐
       │                │              │              │
┌──────▼──────┐  ┌──────▼──────┐  ┌───▼──────┐  ┌───▼──────┐
│ useKanban   │  │ useKanban   │  │useKanban │  │useKanban │
│ DragDrop    │  │   Data      │  │Columns   │  │Selection │
│             │  │             │  │          │  │          │
│ - Máquina   │  │ - Fetch     │  │- CRUD    │  │- Toggle  │
│   de estado │  │ - CRUD      │  │- Reorder │  │- Batch   │
│ - Sem race  │  │ - Sync      │  │- Colors  │  │- Clear   │
│   conditions│  │             │  │          │  │          │
└──────┬──────┘  └──────┬──────┘  └───┬──────┘  └───┬──────┘
       │                │              │              │
       └────────────────┴──────────────┴──────────────┘
                        │
                ┌───────▼────────┐
                │  Supabase      │
                │  (Realtime)    │
                └────────────────┘
```

---

## 🎯 Prioridades de Refatoração

### Fase 1 (Crítico)
1. Centralizar drag-drop state em um único composable
2. Remover transições complexas (usar CSS puro)
3. Implementar virtualização

### Fase 2 (Alto)
1. Dividir `tarefas.vue` em composables menores
2. Adicionar testes unitários
3. Melhorar type safety

### Fase 3 (Médio)
1. Adicionar feedback visual claro
2. Implementar undo/redo funcional
3. Adicionar sincronização em tempo real

---

## 💡 Lições Aprendidas

1. **Drag-drop é complexo** - Precisa de máquina de estados clara
2. **Race conditions são inevitáveis** - Use `nextTick()` + timeouts com cuidado
3. **Menos é mais** - Remover efeitos visuais complexos melhora performance
4. **Virtualização é essencial** - Com 100+ items, é obrigatório
5. **Testes salvam vidas** - Sem testes, refatorações são arriscadas
6. **Type safety importa** - Previne bugs em tempo de desenvolvimento
7. **Sincronização em tempo real é importante** - Usuários esperam dados atualizados

---

## 📊 Estimativa de Esforço

| Tarefa | Esforço | Impacto |
|--------|---------|--------|
| Centralizar drag-drop | 16h | 🔴🔴🔴 |
| Remover transições complexas | 8h | 🔴🔴 |
| Implementar virtualização | 12h | 🔴🔴🔴 |
| Dividir composables | 20h | 🟠🟠 |
| Adicionar testes | 24h | 🟠🟠🟠 |
| Melhorar type safety | 12h | 🟠 |
| **Total** | **92h** | - |

Se refizesse tudo do zero: **~60h** (35% mais rápido)
