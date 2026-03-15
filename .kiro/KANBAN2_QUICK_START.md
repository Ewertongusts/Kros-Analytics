# Kanban 2 - Quick Start Guide

## 🚀 Começar Rápido

### 1. Importar Composables

```typescript
import { 
  useKanban2DragDrop, 
  useKanban2Data, 
  useKanban2Selection, 
  useKanban2Columns 
} from '~/composables/kanban2'
```

### 2. Usar em Componente

```vue
<script setup lang="ts">
import { onMounted } from 'vue'

const dragDrop = useKanban2DragDrop()
const data = useKanban2Data()
const selection = useKanban2Selection()
const columns = useKanban2Columns()

// Carregar dados
onMounted(async () => {
  await data.fetchTasks()
  await data.fetchColumns()
})
</script>
```

---

## 📖 Exemplos de Uso

### useKanban2DragDrop

```typescript
// Iniciar drag
dragDrop.startDrag(task, 'column-1')

// Atualizar posição durante drag
dragDrop.moveDrag('column-2', 'below')

// Completar drop
await dragDrop.completeDrop(async (taskId, fromColumnId, toColumnId, position) => {
  await data.moveTask(taskId, fromColumnId, toColumnId, position)
})

// Cancelar drag
dragDrop.cancelDrag()

// Acessar estado
console.log(dragDrop.dragState.value.isDragging)
console.log(dragDrop.dragState.value.taskId)
```

### useKanban2Data

```typescript
// Buscar dados
await data.fetchTasks()
await data.fetchColumns()

// Acessar dados
console.log(data.tasks.value)
console.log(data.columns.value)

// Operações CRUD
const newTask = await data.addTask({
  title: 'Nova Tarefa',
  description: 'Descrição',
  column_id: 'column-1',
  status: 'todo'
})

await data.updateTask('task-1', { title: 'Atualizado' })
await data.deleteTask('task-1')

// Mover tarefa
await data.moveTask('task-1', 'column-1', 'column-2', 'below')

// Buscar dados específicos
const tasks = data.getTasksByColumn('column-1')
const task = data.getTaskById('task-1')
const column = data.getColumnById('column-1')
```

### useKanban2Selection

```typescript
// Toggle seleção
selection.toggleSelection('task-1')

// Selecionar todas
selection.selectAll(['task-1', 'task-2', 'task-3'])

// Limpar seleção
selection.clearSelection()

// Verificar se selecionada
if (selection.isSelected('task-1')) {
  console.log('Task 1 está selecionada')
}

// Acessar seleção
console.log(selection.selectionCount.value)      // Quantidade
console.log(selection.hasSelection.value)        // Tem seleção?
console.log(selection.selectedIds.value)         // Array de IDs

// Operações avançadas
selection.invertSelection(['task-1', 'task-2', 'task-3'])
selection.addToSelection('task-4')
selection.removeFromSelection('task-1')
selection.selectMultiple(['task-2', 'task-3'])
selection.deselectMultiple(['task-1', 'task-2'])
```

### useKanban2Columns

```typescript
// Adicionar coluna
const newColumn = await columns.addColumn('Nova Coluna', '#FF0000')

// Atualizar coluna
await columns.updateColumn('column-1', { name: 'Atualizado' })

// Deletar coluna
await columns.deleteColumn('column-1')

// Reordenar colunas
await columns.reorderColumns(['column-3', 'column-1', 'column-2'])

// Mover coluna para posição
columns.moveColumn('column-1', 2)

// Buscar dados
const column = columns.getColumnById('column-1')
const index = columns.getColumnIndex('column-1')

// Verificar existência
if (columns.columnExists('column-1')) {
  console.log('Coluna existe')
}

// Acessar dados
console.log(columns.columns.value)           // Todas as colunas
console.log(columns.sortedColumns.value)     // Colunas ordenadas
console.log(columns.columnCount.value)       // Quantidade
```

---

## 🎯 Fluxo Completo - Drag-Drop

```typescript
// 1. Usuário começa a arrastar
const handleDragStart = (task: Task, columnId: string) => {
  dragDrop.startDrag(task, columnId)
}

// 2. Usuário move o mouse
const handleDragOver = (toColumnId: string, position: 'above' | 'below') => {
  dragDrop.moveDrag(toColumnId, position)
}

// 3. Usuário solta o card
const handleDrop = async (task: Task, toColumnId: string) => {
  await dragDrop.completeDrop(async (taskId, fromColumnId, toColumnId, position) => {
    // Atualizar no banco
    await data.moveTask(taskId, fromColumnId, toColumnId, position)
  })
}

// 4. Usuário cancela (ESC)
const handleCancel = () => {
  dragDrop.cancelDrag()
}
```

---

## 🎨 Usar em Template

```vue
<template>
  <div class="kanban-board">
    <!-- Colunas -->
    <div 
      v-for="column in columns.sortedColumns.value"
      :key="column.id"
      class="column"
      @dragover="handleDragOver(column.id, 'below')"
      @drop="handleDrop(column.id)"
    >
      <h2>{{ column.name }}</h2>
      
      <!-- Cards -->
      <div 
        v-for="task in data.getTasksByColumn(column.id)"
        :key="task.id"
        class="card"
        :class="{ 
          'is-dragging': dragDrop.dragState.value.taskId === task.id,
          'is-selected': selection.isSelected(task.id)
        }"
        draggable="true"
        @dragstart="handleDragStart(task, column.id)"
        @dragend="dragDrop.resetDrag()"
      >
        <!-- Checkbox -->
        <input 
          type="checkbox"
          :checked="selection.isSelected(task.id)"
          @change="selection.toggleSelection(task.id)"
        />
        
        <!-- Conteúdo -->
        <h3>{{ task.title }}</h3>
        <p>{{ task.description }}</p>
      </div>
    </div>
    
    <!-- Batch Actions -->
    <div v-if="selection.hasSelection.value" class="batch-actions">
      <p>{{ selection.selectionCount.value }} selecionadas</p>
      <button @click="selection.clearSelection()">Limpar</button>
    </div>
  </div>
</template>
```

---

## ⚠️ Cuidados Importantes

### 1. Readonly Exports
```typescript
// ❌ ERRADO - Não funciona
dragDrop.dragState.value.isDragging = true

// ✅ CORRETO - Use os métodos
dragDrop.startDrag(task, columnId)
```

### 2. Sempre Await
```typescript
// ❌ ERRADO - Sem await
data.fetchTasks()

// ✅ CORRETO - Com await
await data.fetchTasks()
```

### 3. Usar Composables em Setup
```typescript
// ❌ ERRADO - Fora de setup
const dragDrop = useKanban2DragDrop()

// ✅ CORRETO - Dentro de setup
<script setup lang="ts">
const dragDrop = useKanban2DragDrop()
</script>
```

### 4. Não Mutar Dados Diretamente
```typescript
// ❌ ERRADO
data.tasks.value.push(newTask)

// ✅ CORRETO
const newTask = await data.addTask({...})
```

---

## 🧪 Testar Composables

### Teste Local
```typescript
import { useKanban2DragDrop } from '~/composables/kanban2'

const dragDrop = useKanban2DragDrop()

// Testar startDrag
dragDrop.startDrag(mockTask, 'column-1')
console.assert(dragDrop.dragState.value.isDragging === true)

// Testar moveDrag
dragDrop.moveDrag('column-2', 'below')
console.assert(dragDrop.dragState.value.toColumnId === 'column-2')

// Testar resetDrag
dragDrop.resetDrag()
console.assert(dragDrop.dragState.value.isDragging === false)
```

---

## 📊 Tipos TypeScript

```typescript
// DragState
interface DragState {
  isDragging: boolean
  taskId: string | null
  fromColumnId: string | null
  toColumnId: string | null
  position: 'above' | 'below' | null
  isDropping: boolean
}

// Column
interface Column {
  id: string
  name: string
  color?: string
  order: number
  created_at: string
  updated_at: string
}

// Task (do composable useTasks)
interface Task {
  id?: string
  title: string
  description?: string
  column_id?: string
  status: string
  created_at: string
  updated_at: string
}
```

---

## 🔗 Referências

- `.kiro/steering/kanban2-implementation.md` - Padrões
- `.kiro/KANBAN2_PHASE2_PLAN.md` - Componentes
- `app/composables/kanban2/index.ts` - Exports
- `tests/composables/kanban2/` - Testes

---

## 💡 Dicas

1. **Sempre use readonly** - Previne bugs
2. **Sempre use await** - Evita race conditions
3. **Sempre use tipos** - TypeScript strict
4. **Sempre trate erros** - Error handling
5. **Sempre teste** - Testes unitários

---

**Data:** 15 de Março de 2026
**Versão:** 1.0.0
