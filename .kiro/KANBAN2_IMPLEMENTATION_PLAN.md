# Kanban 2 - Plano de Implementação

## 🎯 Objetivo
Criar uma nova página `kanban2.vue` com a **mesma aparência visual** do kanban atual, mas com **arquitetura limpa e sem bugs**.

---

## 📁 Estrutura de Arquivos

```
app/
├── pages/
│   ├── tarefas.vue (original - manter)
│   └── kanban2.vue (NOVO - limpo)
│
├── composables/
│   ├── kanban2/
│   │   ├── useKanban2DragDrop.ts (máquina de estados centralizada)
│   │   ├── useKanban2Data.ts (fetch, CRUD, sync)
│   │   ├── useKanban2Selection.ts (seleção de cards)
│   │   └── useKanban2Columns.ts (gerenciar colunas)
│   │
│   └── (manter composables antigos)
│
├── components/
│   ├── kanban2/
│   │   ├── Kanban2Board.vue (container principal)
│   │   ├── Kanban2Column.vue (coluna com virtualização)
│   │   ├── Kanban2Card.vue (card simplificado)
│   │   └── Kanban2Modal.vue (modal de tarefa)
│   │
│   └── (manter componentes antigos)
│
└── styles/
    └── kanban2.css (estilos - copiar de drag-animations.css)
```

---

## 🔧 Fase 1: Composables (16h)

### 1.1 `useKanban2DragDrop.ts` (6h)
**Máquina de estados centralizada para drag-drop**

```typescript
interface DragState {
  isDragging: boolean
  taskId: string | null
  fromColumnId: string | null
  toColumnId: string | null
  position: 'above' | 'below' | null
  isDropping: boolean
}

export const useKanban2DragDrop = () => {
  const dragState = ref<DragState>({
    isDragging: false,
    taskId: null,
    fromColumnId: null,
    toColumnId: null,
    position: null,
    isDropping: false
  })

  const startDrag = (task: Task, columnId: string) => {
    dragState.value = {
      isDragging: true,
      taskId: task.id,
      fromColumnId: columnId,
      toColumnId: null,
      position: null,
      isDropping: false
    }
  }

  const moveDrag = (toColumnId: string, position: 'above' | 'below') => {
    dragState.value.toColumnId = toColumnId
    dragState.value.position = position
  }

  const completeDrop = async (moveTaskFn: Function) => {
    if (!dragState.value.taskId || !dragState.value.toColumnId) return

    dragState.value.isDropping = true

    try {
      // 1. Mark as exiting
      // 2. await nextTick()
      // 3. Call moveTaskFn
      // 4. Mark as entering
      // 5. Reset state
      
      await moveTaskFn(
        dragState.value.taskId,
        dragState.value.toColumnId,
        dragState.value.position
      )
    } finally {
      resetDrag()
    }
  }

  const resetDrag = () => {
    dragState.value = {
      isDragging: false,
      taskId: null,
      fromColumnId: null,
      toColumnId: null,
      position: null,
      isDropping: false
    }
  }

  return {
    dragState: readonly(dragState),
    startDrag,
    moveDrag,
    completeDrop,
    resetDrag
  }
}
```

**Checklist:**
- [ ] Máquina de estados sem race conditions
- [ ] Sem `nextTick()` necessário (fluxo linear)
- [ ] Testes unitários

---

### 1.2 `useKanban2Data.ts` (5h)
**Gerenciar dados de tarefas e colunas**

```typescript
export const useKanban2Data = () => {
  const tasks = ref<Task[]>([])
  const columns = ref<Column[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTasks = async () => {
    loading.value = true
    try {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .order('position')
      tasks.value = data || []
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchColumns = async () => {
    loading.value = true
    try {
      const { data } = await supabase
        .from('kanban_columns')
        .select('*')
        .order('position')
      columns.value = data || []
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const moveTask = async (
    taskId: string,
    toColumnId: string,
    position?: 'above' | 'below'
  ) => {
    // Atualizar posição se necessário
    // Chamar Supabase
    // Atualizar estado local
  }

  const addTask = async (task: Partial<Task>) => {
    // Criar tarefa
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    // Atualizar tarefa
  }

  const deleteTask = async (taskId: string) => {
    // Deletar tarefa
  }

  return {
    tasks: readonly(tasks),
    columns: readonly(columns),
    loading: readonly(loading),
    error: readonly(error),
    fetchTasks,
    fetchColumns,
    moveTask,
    addTask,
    updateTask,
    deleteTask
  }
}
```

**Checklist:**
- [ ] Fetch de tarefas e colunas
- [ ] CRUD operations
- [ ] Error handling
- [ ] Loading states

---

### 1.3 `useKanban2Selection.ts` (3h)
**Gerenciar seleção de cards**

```typescript
export const useKanban2Selection = () => {
  const selectedTaskIds = ref<Set<string>>(new Set())

  const toggleSelection = (taskId: string) => {
    if (selectedTaskIds.value.has(taskId)) {
      selectedTaskIds.value.delete(taskId)
    } else {
      selectedTaskIds.value.add(taskId)
    }
  }

  const selectAll = (taskIds: string[]) => {
    selectedTaskIds.value = new Set(taskIds)
  }

  const clearSelection = () => {
    selectedTaskIds.value.clear()
  }

  const isSelected = (taskId: string) => {
    return selectedTaskIds.value.has(taskId)
  }

  return {
    selectedTaskIds: readonly(selectedTaskIds),
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected
  }
}
```

**Checklist:**
- [ ] Toggle selection
- [ ] Select all
- [ ] Clear selection

---

### 1.4 `useKanban2Columns.ts` (2h)
**Gerenciar colunas**

```typescript
export const useKanban2Columns = () => {
  const columns = ref<Column[]>([])

  const addColumn = async (name: string, color: string) => {
    // Criar coluna
  }

  const updateColumn = async (columnId: string, updates: Partial<Column>) => {
    // Atualizar coluna
  }

  const deleteColumn = async (columnId: string) => {
    // Deletar coluna
  }

  const reorderColumns = async (columnIds: string[]) => {
    // Reordenar colunas
  }

  return {
    columns: readonly(columns),
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns
  }
}
```

**Checklist:**
- [ ] CRUD de colunas
- [ ] Reordenação

---

## 🎨 Fase 2: Componentes (20h)

### 2.1 `Kanban2Card.vue` (4h)
**Card simplificado - sem transições complexas**

```vue
<template>
  <div
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    :class="[
      'card',
      { 'card--dragging': isDragging },
      { 'card--selected': isSelected }
    ]"
  >
    <!-- Checkbox -->
    <input
      type="checkbox"
      :checked="isSelected"
      @change="$emit('select')"
      class="card__checkbox"
    />

    <!-- Conteúdo -->
    <div class="card__content">
      <h3 class="card__title">{{ task.title }}</h3>
      <p v-if="task.description" class="card__description">
        {{ task.description }}
      </p>
    </div>

    <!-- Footer -->
    <div class="card__footer">
      <span class="card__priority">{{ task.priority }}</span>
      <span v-if="task.due_date" class="card__date">
        {{ formatDate(task.due_date) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  task: Task
  isDragging: boolean
  isSelected: boolean
}>()

const emit = defineEmits<{
  dragstart: [event: DragEvent]
  dragend: []
  select: []
}>()

const handleDragStart = (e: DragEvent) => {
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('application/json', JSON.stringify(props.task))
  emit('dragstart', e)
}

const handleDragEnd = () => {
  emit('dragend')
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}
</script>

<style scoped>
.card {
  padding: 12px;
  background: #1c1c1e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: grab;
  transition: all 200ms ease;
}

.card--dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.card--selected {
  border-color: rgba(34, 197, 94, 0.5);
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.card__checkbox {
  margin-right: 8px;
}

.card__content {
  margin: 8px 0;
}

.card__title {
  font-weight: 600;
  color: white;
  margin: 0;
}

.card__description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 4px 0 0 0;
}

.card__footer {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.card__priority {
  background: rgba(255, 193, 7, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

.card__date {
  background: rgba(59, 130, 246, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
```

**Checklist:**
- [ ] Sem transições complexas
- [ ] Sem partículas
- [ ] Sem múltiplos estados
- [ ] CSS puro

---

### 2.2 `Kanban2Column.vue` (6h)
**Coluna com virtualização**

```vue
<template>
  <div class="column">
    <!-- Header -->
    <div class="column__header">
      <h2 class="column__title">{{ column.name }}</h2>
      <span class="column__count">{{ tasks.length }}</span>
      <button @click="$emit('add-task')" class="column__add-btn">+</button>
    </div>

    <!-- Cards com Virtualização -->
    <VirtualScroller
      :items="tasks"
      :item-size="120"
      class="column__content"
      key-field="id"
    >
      <template #default="{ item }">
        <Kanban2Card
          :task="item"
          :is-dragging="dragState.taskId === item.id"
          :is-selected="isSelected(item.id)"
          @dragstart="handleCardDragStart(item)"
          @dragend="handleCardDragEnd"
          @select="toggleSelection(item.id)"
        />
      </template>
    </VirtualScroller>

    <!-- Drop Zone -->
    <div
      class="column__drop-zone"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      :class="{ 'column__drop-zone--active': isDragOver }"
    >
      Solte aqui
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VirtualScroller from 'vue-virtual-scroller'
import Kanban2Card from './Kanban2Card.vue'

const props = defineProps<{
  column: Column
  tasks: Task[]
  dragState: DragState
  isSelected: (taskId: string) => boolean
  toggleSelection: (taskId: string) => void
}>()

const emit = defineEmits<{
  'add-task': []
  'card-dragstart': [task: Task]
  'card-dragend': []
  'drop': [event: DragEvent]
}>()

const isDragOver = ref(false)

const handleCardDragStart = (task: Task) => {
  emit('card-dragstart', task)
}

const handleCardDragEnd = () => {
  emit('card-dragend')
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  emit('drop', e)
}
</script>

<style scoped>
.column {
  width: 220px;
  background: #1a1a1c;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
}

.column__header {
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 8px;
}

.column__title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.column__count {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.column__add-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 16px;
  padding: 0;
}

.column__content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.column__drop-zone {
  padding: 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin: 8px;
  transition: all 200ms ease;
}

.column__drop-zone--active {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.1);
  color: rgba(59, 130, 246, 0.7);
}
</style>
```

**Checklist:**
- [ ] Virtualização funcionando
- [ ] Drop zone visual
- [ ] Sem memory leaks

---

### 2.3 `Kanban2Board.vue` (7h)
**Container principal - orquestração**

```vue
<template>
  <div class="board">
    <!-- Colunas -->
    <div class="board__columns">
      <Kanban2Column
        v-for="column in columns"
        :key="column.id"
        :column="column"
        :tasks="getTasksInColumn(column.id)"
        :drag-state="dragState"
        :is-selected="isSelected"
        :toggle-selection="toggleSelection"
        @card-dragstart="handleCardDragStart"
        @card-dragend="handleCardDragEnd"
        @drop="handleDrop($event, column.id)"
        @add-task="openTaskModal(column.id)"
      />

      <!-- Add Column Button -->
      <button @click="addColumn" class="board__add-column">
        + Add Column
      </button>
    </div>

    <!-- Modal -->
    <Kanban2Modal
      v-if="isModalOpen"
      :task="selectedTask"
      @close="closeModal"
      @save="handleSaveTask"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Kanban2Column from './Kanban2Column.vue'
import Kanban2Modal from './Kanban2Modal.vue'
import { useKanban2DragDrop } from '~/composables/kanban2/useKanban2DragDrop'
import { useKanban2Data } from '~/composables/kanban2/useKanban2Data'
import { useKanban2Selection } from '~/composables/kanban2/useKanban2Selection'

const { dragState, startDrag, moveDrag, completeDrop, resetDrag } = useKanban2DragDrop()
const { tasks, columns, fetchTasks, fetchColumns, moveTask } = useKanban2Data()
const { selectedTaskIds, toggleSelection, isSelected } = useKanban2Selection()

const isModalOpen = ref(false)
const selectedTask = ref<Task | null>(null)
const selectedColumnId = ref<string | null>(null)

onMounted(async () => {
  await fetchTasks()
  await fetchColumns()
})

const getTasksInColumn = (columnId: string) => {
  return tasks.value.filter(t => t.column_id === columnId)
}

const handleCardDragStart = (task: Task) => {
  startDrag(task, task.column_id)
}

const handleCardDragEnd = () => {
  resetDrag()
}

const handleDrop = async (e: DragEvent, toColumnId: string) => {
  e.preventDefault()
  
  if (!dragState.value.taskId) return

  moveDrag(toColumnId, 'below')
  
  await completeDrop(async () => {
    await moveTask(dragState.value.taskId!, toColumnId)
  })
}

const openTaskModal = (columnId: string) => {
  selectedColumnId.value = columnId
  selectedTask.value = null
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedTask.value = null
}

const handleSaveTask = async (task: Task) => {
  // Salvar tarefa
  closeModal()
}

const addColumn = async () => {
  const name = prompt('Nome da coluna:')
  if (name) {
    // Adicionar coluna
  }
}
</script>

<style scoped>
.board {
  display: flex;
  gap: 12px;
  padding: 20px;
  overflow-x: auto;
  height: 100vh;
}

.board__columns {
  display: flex;
  gap: 12px;
  flex: 1;
}

.board__add-column {
  width: 220px;
  height: 100px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  font-size: 14px;
  transition: all 200ms ease;
}

.board__add-column:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
}
</style>
```

**Checklist:**
- [ ] Orquestração limpa
- [ ] Sem lógica complexa
- [ ] Fácil de entender

---

### 2.4 `Kanban2Modal.vue` (3h)
**Modal de tarefa - simplificado**

**Checklist:**
- [ ] Form de tarefa
- [ ] Validação básica
- [ ] Save/Cancel

---

## 📄 Fase 3: Page (4h)

### 3.1 `kanban2.vue`
**Página principal**

```vue
<template>
  <LayoutsKPageLayout max-width="100%">
    <Kanban2Board />
  </LayoutsKPageLayout>
</template>

<script setup lang="ts">
import Kanban2Board from '~/components/kanban2/Kanban2Board.vue'

definePageMeta({
  middleware: 'auth'
})
</script>
```

**Checklist:**
- [ ] Rota configurada
- [ ] Middleware de auth
- [ ] Layout correto

---

## 🧪 Fase 4: Testes (12h)

### 4.1 Testes Unitários
```typescript
// tests/composables/useKanban2DragDrop.spec.ts
describe('useKanban2DragDrop', () => {
  it('should initialize with empty drag state', () => {
    const { dragState } = useKanban2DragDrop()
    expect(dragState.value.isDragging).toBe(false)
  })

  it('should start drag correctly', () => {
    const { dragState, startDrag } = useKanban2DragDrop()
    const task = { id: '1', title: 'Test' }
    
    startDrag(task, 'column-1')
    
    expect(dragState.value.isDragging).toBe(true)
    expect(dragState.value.taskId).toBe('1')
  })

  it('should complete drop without race conditions', async () => {
    const { dragState, startDrag, completeDrop } = useKanban2DragDrop()
    const task = { id: '1', title: 'Test' }
    
    startDrag(task, 'column-1')
    
    let moveTaskCalled = false
    await completeDrop(async () => {
      moveTaskCalled = true
    })
    
    expect(moveTaskCalled).toBe(true)
    expect(dragState.value.isDragging).toBe(false)
  })
})
```

**Checklist:**
- [ ] Testes de drag-drop
- [ ] Testes de data
- [ ] Testes de selection
- [ ] 80%+ coverage

---

## 📊 Timeline

| Fase | Tarefa | Horas | Status |
|------|--------|-------|--------|
| 1 | Composables | 16h | ⏳ |
| 2 | Componentes | 20h | ⏳ |
| 3 | Page | 4h | ⏳ |
| 4 | Testes | 12h | ⏳ |
| **Total** | | **52h** | |

---

## 🎯 Comparação: Tarefas vs Kanban2

| Aspecto | Tarefas | Kanban2 |
|--------|---------|---------|
| Linhas de código | 1000+ | ~300 |
| Composables | 8+ | 4 |
| Race conditions | Múltiplas | 0 |
| Memory leaks | Sim | Não |
| Testes | Não | Sim |
| Virtualização | Não | Sim |
| Type safety | Parcial | Total |
| Performance | Lenta | Rápida |

---

## ✅ Checklist de Implementação

### Semana 1
- [ ] Criar estrutura de pastas
- [ ] Implementar `useKanban2DragDrop.ts`
- [ ] Implementar `useKanban2Data.ts`
- [ ] Implementar `useKanban2Selection.ts`
- [ ] Implementar `useKanban2Columns.ts`

### Semana 2
- [ ] Implementar `Kanban2Card.vue`
- [ ] Implementar `Kanban2Column.vue`
- [ ] Implementar `Kanban2Board.vue`
- [ ] Implementar `Kanban2Modal.vue`
- [ ] Criar `kanban2.vue`

### Semana 3
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Bug fixes
- [ ] Performance tuning

### Semana 4
- [ ] Comparação com tarefas.vue
- [ ] Documentação
- [ ] Deploy

---

## 🚀 Próximos Passos

1. **Começar com composables** - São a base de tudo
2. **Depois componentes** - Mais fácil com composables prontos
3. **Testes enquanto desenvolve** - Não deixar para o final
4. **Comparar com tarefas.vue** - Ver diferenças de performance

---

## 💡 Dicas

- Copiar estilos de `drag-animations.css` para manter aparência igual
- Usar `vue-virtual-scroller` desde o início
- Não adicionar features extras - apenas o básico
- Testar drag-drop muito bem antes de passar para próxima fase
- Medir performance com DevTools

