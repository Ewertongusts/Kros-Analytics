# Kanban 2 - Fase 2: Componentes (20h)

## 📋 Visão Geral

Implementar 4 componentes Vue 3 que usam os composables da Fase 1 para criar uma interface Kanban limpa e performática.

**Tempo Estimado:** 20 horas
**Componentes:** 4
**Padrão:** Nuxt 4 auto-import + Composition API

---

## 🎯 Componentes a Implementar

### 1️⃣ `Kanban2Card.vue` (4h)

**Responsabilidade:** Renderizar um card individual com drag-drop

**Props:**
```typescript
interface Props {
  task: Task
  columnId: string
  isSelected: boolean
  isDragging: boolean
  isDragOver: boolean
  dragPosition?: 'above' | 'below'
}
```

**Emits:**
```typescript
emit('drag-start', { task, columnId })
emit('drag-over', { columnId, position })
emit('drop', { task, columnId })
emit('toggle-select', taskId)
emit('edit', task)
emit('delete', taskId)
```

**Features:**
- ✅ Drag-drop visual feedback
- ✅ Checkbox para seleção
- ✅ Hover effects
- ✅ Animações suaves
- ✅ Ações rápidas (edit, delete)
- ✅ Indicadores de status
- ✅ Responsive design

**Estrutura:**
```vue
<template>
  <div 
    class="kanban2-card"
    :class="{ 
      'is-dragging': isDragging,
      'is-drag-over': isDragOver,
      'is-selected': isSelected,
      'drag-above': dragPosition === 'above',
      'drag-below': dragPosition === 'below'
    }"
    @dragstart="handleDragStart"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @dragend="handleDragEnd"
  >
    <!-- Checkbox -->
    <input 
      type="checkbox" 
      :checked="isSelected"
      @change="$emit('toggle-select', task.id)"
    />
    
    <!-- Conteúdo -->
    <div class="card-content">
      <h3>{{ task.title }}</h3>
      <p>{{ task.description }}</p>
    </div>
    
    <!-- Ações -->
    <div class="card-actions">
      <button @click="$emit('edit', task)">✏️</button>
      <button @click="$emit('delete', task.id)">🗑️</button>
    </div>
  </div>
</template>
```

**Estilos:**
- Copiar de `drag-animations.css`
- Adicionar `.kanban2-card` classes
- Animações de entrada/saída
- Feedback visual de drag

---

### 2️⃣ `Kanban2Column.vue` (5h)

**Responsabilidade:** Renderizar uma coluna com múltiplos cards

**Props:**
```typescript
interface Props {
  column: Column
  tasks: Task[]
  selectedTaskIds: Set<string>
  dragState: DragState
}
```

**Emits:**
```typescript
emit('task-drag-start', { task, columnId })
emit('task-drag-over', { columnId, position })
emit('task-drop', { task, columnId })
emit('task-select', taskId)
emit('task-edit', task)
emit('task-delete', taskId)
emit('column-edit', column)
emit('column-delete', columnId)
emit('add-task', columnId)
```

**Features:**
- ✅ Renderizar múltiplos cards
- ✅ Drop zone para novos cards
- ✅ Contador de cards
- ✅ Ações de coluna (edit, delete)
- ✅ Botão "Add Task"
- ✅ Scroll suave
- ✅ Virtualização (opcional para Fase 2)

**Estrutura:**
```vue
<template>
  <div class="kanban2-column">
    <!-- Header -->
    <div class="column-header">
      <h2>{{ column.name }}</h2>
      <span class="card-count">{{ tasks.length }}</span>
      <div class="column-actions">
        <button @click="$emit('column-edit', column)">✏️</button>
        <button @click="$emit('column-delete', column.id)">🗑️</button>
      </div>
    </div>
    
    <!-- Cards -->
    <div class="column-cards">
      <Kanban2Card
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :columnId="column.id"
        :isSelected="selectedTaskIds.has(task.id)"
        :isDragging="dragState.taskId === task.id"
        :isDragOver="dragState.toColumnId === column.id"
        :dragPosition="dragState.position"
        @drag-start="$emit('task-drag-start', $event)"
        @drag-over="$emit('task-drag-over', $event)"
        @drop="$emit('task-drop', $event)"
        @toggle-select="$emit('task-select', $event)"
        @edit="$emit('task-edit', $event)"
        @delete="$emit('task-delete', $event)"
      />
    </div>
    
    <!-- Add Task Button -->
    <button 
      class="add-task-btn"
      @click="$emit('add-task', column.id)"
    >
      + Adicionar Tarefa
    </button>
  </div>
</template>
```

---

### 3️⃣ `Kanban2Board.vue` (8h)

**Responsabilidade:** Orquestrar todo o board com múltiplas colunas

**Props:**
```typescript
interface Props {
  // Nenhuma prop necessária - usa composables
}
```

**Features:**
- ✅ Renderizar múltiplas colunas
- ✅ Gerenciar drag-drop entre colunas
- ✅ Sincronizar estado com Supabase
- ✅ Ações em batch
- ✅ Filtros e busca
- ✅ Realtime updates
- ✅ Undo/Redo (opcional)

**Estrutura:**
```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { 
  useKanban2DragDrop, 
  useKanban2Data, 
  useKanban2Selection, 
  useKanban2Columns 
} from '~/composables/kanban2'

const dragDrop = useKanban2DragDrop()
const data = useKanban2Data()
const selection = useKanban2Selection()
const columns = useKanban2Columns()

onMounted(async () => {
  await data.fetchTasks()
  await data.fetchColumns()
})

const handleTaskDragStart = (task, columnId) => {
  dragDrop.startDrag(task, columnId)
}

const handleTaskDragOver = (columnId, position) => {
  dragDrop.moveDrag(columnId, position)
}

const handleTaskDrop = async (task, columnId) => {
  await dragDrop.completeDrop(async (taskId, fromColumnId, toColumnId, position) => {
    await data.moveTask(taskId, fromColumnId, toColumnId, position)
  })
}

const handleTaskSelect = (taskId) => {
  selection.toggleSelection(taskId)
}
</script>

<template>
  <div class="kanban2-board">
    <!-- Header -->
    <div class="board-header">
      <h1>Kanban 2</h1>
      <div class="board-actions">
        <!-- Filtros, busca, etc -->
      </div>
    </div>
    
    <!-- Colunas -->
    <div class="board-columns">
      <Kanban2Column
        v-for="column in columns.sortedColumns.value"
        :key="column.id"
        :column="column"
        :tasks="data.getTasksByColumn(column.id)"
        :selectedTaskIds="selection.selectedTaskIds.value"
        :dragState="dragDrop.dragState.value"
        @task-drag-start="handleTaskDragStart"
        @task-drag-over="handleTaskDragOver"
        @task-drop="handleTaskDrop"
        @task-select="handleTaskSelect"
        @task-edit="handleTaskEdit"
        @task-delete="handleTaskDelete"
        @column-edit="handleColumnEdit"
        @column-delete="handleColumnDelete"
        @add-task="handleAddTask"
      />
    </div>
    
    <!-- Batch Actions -->
    <Kanban2BatchActions
      v-if="selection.hasSelection.value"
      :selectedCount="selection.selectionCount.value"
      @delete="handleBatchDelete"
      @move="handleBatchMove"
      @close="selection.clearSelection()"
    />
  </div>
</template>
```

---

### 4️⃣ `Kanban2Modal.vue` (3h)

**Responsabilidade:** Modal para editar/criar tarefas

**Props:**
```typescript
interface Props {
  task?: Task
  columnId: string
  isOpen: boolean
}
```

**Emits:**
```typescript
emit('save', task)
emit('delete', taskId)
emit('close')
```

**Features:**
- ✅ Formulário de edição
- ✅ Validação
- ✅ Salvar/Cancelar
- ✅ Deletar tarefa
- ✅ Animações suaves

---

## 📊 Estrutura de Arquivos

```
app/components/kanban2/
├── Kanban2Card.vue        (150 linhas)
├── Kanban2Column.vue      (200 linhas)
├── Kanban2Board.vue       (300 linhas)
├── Kanban2Modal.vue       (150 linhas)
└── Kanban2BatchActions.vue (100 linhas)

app/styles/
└── kanban2.css            (Copiar de drag-animations.css)
```

---

## 🎨 Estilos

### Copiar de `drag-animations.css`
- `.card-dragging`
- `.card-entering`
- `.card-exiting`
- `.card-settling`
- `.drag-over-above`
- `.drag-over-below`

### Adicionar Novos
- `.kanban2-card`
- `.kanban2-column`
- `.kanban2-board`
- `.kanban2-modal`
- `.batch-actions`

---

## 🔄 Fluxo de Dados

```
Kanban2Board (Orquestrador)
├── useKanban2DragDrop (Estado de drag)
├── useKanban2Data (Dados)
├── useKanban2Selection (Seleção)
└── useKanban2Columns (Colunas)

Kanban2Board
├── Kanban2Column (x N)
│   ├── Kanban2Card (x M)
│   └── Kanban2BatchActions
└── Kanban2Modal
```

---

## 🧪 Testes de Componentes

### Kanban2Card
- Renderizar card com dados
- Drag-drop events
- Seleção
- Ações (edit, delete)

### Kanban2Column
- Renderizar múltiplos cards
- Drop zone
- Contador
- Ações de coluna

### Kanban2Board
- Renderizar múltiplas colunas
- Sincronizar com Supabase
- Drag-drop entre colunas
- Batch actions

### Kanban2Modal
- Abrir/fechar
- Validação
- Salvar/deletar

---

## 📝 Checklist - Fase 2

- [ ] Criar `Kanban2Card.vue`
- [ ] Criar `Kanban2Column.vue`
- [ ] Criar `Kanban2Board.vue`
- [ ] Criar `Kanban2Modal.vue`
- [ ] Criar `Kanban2BatchActions.vue`
- [ ] Criar `kanban2.css`
- [ ] Testes de componentes
- [ ] Integração com composables
- [ ] Realtime sync
- [ ] Undo/Redo (opcional)

---

## 🚀 Próximos Passos

1. **Fase 2:** Implementar componentes (20h)
2. **Fase 3:** Criar página `kanban2.vue` (4h)
3. **Fase 4:** Testes e otimizações (12h)
4. **Comparação:** Kanban 2 vs Tarefas

---

## 💡 Dicas

1. **Reutilizar Estilos** - Copiar de `drag-animations.css`
2. **Composables Primeiro** - Usar composables da Fase 1
3. **Testes Incrementais** - Testar cada componente isoladamente
4. **Performance** - Usar `v-memo` para cards
5. **Acessibilidade** - Adicionar ARIA labels

---

**Data:** 15 de Março de 2026
**Status:** 📋 PLANEJADO
