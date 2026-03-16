# Kanban 2 Implementation - Steering Guide

## 🏗️ Nossa Stack & Arquitetura

### Tech Stack
- **Framework:** Nuxt 4 (Vue 3 Composition API)
- **Database:** Supabase (PostgreSQL + Realtime)
- **Styling:** Tailwind CSS + Custom CSS
- **State Management:** Vue Refs + Composables (sem Pinia)
- **Build:** Vite
- **Language:** TypeScript

### Padrões de Desenvolvimento

#### 1. **Componentização Nuxt 4**
Seguimos a estrutura padrão do Nuxt 4:

```
app/
├── components/
│   ├── blocks/          # Componentes de negócio (KDashboard, KFinance, etc)
│   ├── clients/         # Componentes específicos de clientes
│   ├── tasks/           # Componentes específicos de tarefas
│   └── kanban2/         # ✨ NOVO: Componentes do Kanban 2
│
├── composables/
│   ├── useTaskHandlers.ts
│   ├── useTaskDragDrop.ts
│   ├── useKanbanColumns.ts
│   └── kanban2/         # ✨ NOVO: Composables do Kanban 2
│       ├── useKanban2DragDrop.ts
│       ├── useKanban2Data.ts
│       ├── useKanban2Selection.ts
│       └── useKanban2Columns.ts
│
├── pages/
│   ├── tarefas.vue      # Kanban original (manter)
│   └── kanban2.vue      # ✨ NOVO: Kanban 2 (limpo)
│
└── styles/
    └── kanban2.css      # ✨ NOVO: Estilos (copiar de drag-animations.css)
```

#### 2. **Composables Pattern**
Usamos composables para lógica reutilizável:

```typescript
// ✅ BOM: Composable com responsabilidade única
export const useKanban2DragDrop = () => {
  const dragState = ref<DragState>({...})
  
  const startDrag = (task, columnId) => {...}
  const moveDrag = (toColumnId, position) => {...}
  const completeDrop = async (moveTaskFn) => {...}
  
  return {
    dragState: readonly(dragState),
    startDrag,
    moveDrag,
    completeDrop
  }
}

// ❌ RUIM: Composable com múltiplas responsabilidades
export const useKanbanEverything = () => {
  // Drag-drop + Data + Selection + Columns + Animations
  // Muito complexo, difícil de testar
}
```

#### 3. **Componentes Nuxt 4**
Componentes auto-importados, sem imports manuais:

```vue
<!-- ✅ Nuxt 4 auto-import -->
<template>
  <Kanban2Board />  <!-- Auto-importado de components/kanban2/ -->
</template>

<!-- ❌ Não precisa fazer isso -->
<script setup lang="ts">
import Kanban2Board from '~/components/kanban2/Kanban2Board.vue'
</script>
```

#### 4. **TypeScript Strict**
Sempre usar tipos explícitos:

```typescript
// ✅ BOM: Tipos explícitos
interface DragState {
  isDragging: boolean
  taskId: string | null
  fromColumnId: string | null
  toColumnId: string | null
  position: 'above' | 'below' | null
  isDropping: boolean
}

const dragState = ref<DragState>({...})

// ❌ RUIM: Sem tipos
const dragState = ref({...})
```

#### 5. **Supabase Integration**
Usar Supabase para dados:

```typescript
// ✅ BOM: Usar Supabase
const { data } = await supabase
  .from('tasks')
  .select('*')
  .eq('column_id', columnId)

// ❌ RUIM: Dados hardcoded
const tasks = [
  { id: '1', title: 'Task 1' },
  { id: '2', title: 'Task 2' }
]
```

---

## 🎯 O Que Vou Fazer - Fase 1: Composables

### Objetivo
Criar 4 composables limpos, testáveis e sem race conditions.

### 1️⃣ `useKanban2DragDrop.ts` (6h)

**Responsabilidade:** Gerenciar estado de drag-drop com máquina de estados clara

**Características:**
- ✅ Estado centralizado em um único `ref<DragState>`
- ✅ Sem `nextTick()` necessário (fluxo linear)
- ✅ Sem race conditions
- ✅ Readonly exports (imutabilidade)
- ✅ Testes unitários inclusos

**Estrutura:**
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
  const dragState = ref<DragState>({...})
  
  // Métodos públicos
  const startDrag = (task: Task, columnId: string) => {...}
  const moveDrag = (toColumnId: string, position: 'above' | 'below') => {...}
  const completeDrop = async (moveTaskFn: Function) => {...}
  const resetDrag = () => {...}
  
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
- [ ] Testes unitários (3+ casos)
- [ ] TypeScript strict
- [ ] Readonly exports
- [ ] Sem side effects

---

### 2️⃣ `useKanban2Data.ts` (5h)

**Responsabilidade:** Gerenciar dados de tarefas e colunas (fetch, CRUD, sync)

**Características:**
- ✅ Fetch de tarefas e colunas do Supabase
- ✅ CRUD operations (create, read, update, delete)
- ✅ Error handling
- ✅ Loading states
- ✅ Realtime sync (opcional para fase 1)

**Estrutura:**
```typescript
export const useKanban2Data = () => {
  const tasks = ref<Task[]>([])
  const columns = ref<Column[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Métodos públicos
  const fetchTasks = async () => {...}
  const fetchColumns = async () => {...}
  const moveTask = async (taskId, toColumnId, position) => {...}
  const addTask = async (task) => {...}
  const updateTask = async (taskId, updates) => {...}
  const deleteTask = async (taskId) => {...}
  
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
- [ ] Testes unitários

---

### 3️⃣ `useKanban2Selection.ts` (3h)

**Responsabilidade:** Gerenciar seleção de cards (checkboxes)

**Características:**
- ✅ Toggle selection
- ✅ Select all
- ✅ Clear selection
- ✅ Check if selected

**Estrutura:**
```typescript
export const useKanban2Selection = () => {
  const selectedTaskIds = ref<Set<string>>(new Set())
  
  // Métodos públicos
  const toggleSelection = (taskId: string) => {...}
  const selectAll = (taskIds: string[]) => {...}
  const clearSelection = () => {...}
  const isSelected = (taskId: string) => boolean
  
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
- [ ] Testes unitários

---

### 4️⃣ `useKanban2Columns.ts` (2h)

**Responsabilidade:** Gerenciar colunas (CRUD + reordenação)

**Características:**
- ✅ Add column
- ✅ Update column
- ✅ Delete column
- ✅ Reorder columns

**Estrutura:**
```typescript
export const useKanban2Columns = () => {
  const columns = ref<Column[]>([])
  
  // Métodos públicos
  const addColumn = async (name: string, color: string) => {...}
  const updateColumn = async (columnId, updates) => {...}
  const deleteColumn = async (columnId) => {...}
  const reorderColumns = async (columnIds) => {...}
  
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
- [ ] Testes unitários

---

## 📝 Padrões de Código

### ✅ Padrão Correto

```typescript
// 1. Tipos bem definidos
interface DragState {
  isDragging: boolean
  taskId: string | null
}

// 2. Composable com responsabilidade única
export const useKanban2DragDrop = () => {
  // 3. Estado centralizado
  const dragState = ref<DragState>({
    isDragging: false,
    taskId: null
  })
  
  // 4. Métodos com tipos explícitos
  const startDrag = (task: Task, columnId: string): void => {
    dragState.value.isDragging = true
    dragState.value.taskId = task.id
  }
  
  // 5. Readonly exports
  return {
    dragState: readonly(dragState),
    startDrag
  }
}

// 6. Uso em componente
const { dragState, startDrag } = useKanban2DragDrop()
```

### ❌ Padrão Incorreto

```typescript
// 1. Sem tipos
const dragState = ref({...})

// 2. Múltiplas responsabilidades
export const useKanbanEverything = () => {
  // Drag-drop + Data + Selection + Columns
}

// 3. Estado espalhado
const isDragging = ref(false)
const taskId = ref(null)
const fromColumnId = ref(null)

// 4. Sem tipos nos métodos
const startDrag = (task, columnId) => {...}

// 5. Exports mutáveis
return {
  dragState  // Sem readonly
}
```

---

## 🧪 Testes

### Estrutura de Testes

```typescript
// tests/composables/kanban2/useKanban2DragDrop.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useKanban2DragDrop } from '~/composables/kanban2/useKanban2DragDrop'

describe('useKanban2DragDrop', () => {
  let dragDrop: ReturnType<typeof useKanban2DragDrop>
  
  beforeEach(() => {
    dragDrop = useKanban2DragDrop()
  })
  
  it('should initialize with empty drag state', () => {
    expect(dragDrop.dragState.value.isDragging).toBe(false)
    expect(dragDrop.dragState.value.taskId).toBeNull()
  })
  
  it('should start drag correctly', () => {
    const task = { id: '1', title: 'Test' } as Task
    dragDrop.startDrag(task, 'column-1')
    
    expect(dragDrop.dragState.value.isDragging).toBe(true)
    expect(dragDrop.dragState.value.taskId).toBe('1')
  })
  
  it('should complete drop without race conditions', async () => {
    const task = { id: '1', title: 'Test' } as Task
    dragDrop.startDrag(task, 'column-1')
    
    let moveTaskCalled = false
    await dragDrop.completeDrop(async () => {
      moveTaskCalled = true
    })
    
    expect(moveTaskCalled).toBe(true)
    expect(dragDrop.dragState.value.isDragging).toBe(false)
  })
})
```

---

## 📦 Dependências

### Já Instaladas
- `vue@3` - Framework
- `nuxt@4` - Meta-framework
- `@supabase/supabase-js` - Database
- `tailwindcss` - Styling
- `typescript` - Type safety

### Precisa Instalar (Fase 2)
- `vue-virtual-scroller` - Virtualização de cards

### Já Temos (Reutilizar)
- `drag-animations.css` - Estilos de drag-drop
- `useKanbanColumns.ts` - Gerenciar colunas (adaptar)

---

## 🚀 Workflow de Desenvolvimento

### 1. Criar Arquivo
```bash
# Criar composable
touch app/composables/kanban2/useKanban2DragDrop.ts

# Criar teste
touch tests/composables/kanban2/useKanban2DragDrop.spec.ts
```

### 2. Implementar Composable
- Definir tipos
- Implementar lógica
- Adicionar readonly exports
- Sem side effects

### 3. Escrever Testes
- Mínimo 3 testes por composable
- Testar casos normais e edge cases
- Testar sem race conditions

### 4. Verificar
```bash
# Rodar testes
npm run test

# Verificar tipos
npm run typecheck

# Lint
npm run lint
```

### 5. Commit
```bash
git add app/composables/kanban2/useKanban2DragDrop.ts
git add tests/composables/kanban2/useKanban2DragDrop.spec.ts
git commit -m "feat: Add useKanban2DragDrop composable with tests"
```

---

## 📊 Comparação: Tarefas vs Kanban2

| Aspecto | Tarefas | Kanban2 |
|--------|---------|---------|
| **Composables** | 8+ (espalhados) | 4 (organizados) |
| **Linhas de código** | 1000+ | ~300 |
| **Race conditions** | Múltiplas | 0 |
| **Memory leaks** | Sim | Não |
| **Testes** | Não | Sim |
| **Type safety** | Parcial | Total |
| **Virtualização** | Não | Sim |
| **Manutenibilidade** | Difícil | Fácil |

---

## ✅ Checklist - Fase 1

### Semana 1
- [ ] Criar estrutura de pastas (`app/composables/kanban2/`)
- [ ] Implementar `useKanban2DragDrop.ts` + testes
- [ ] Implementar `useKanban2Data.ts` + testes
- [ ] Implementar `useKanban2Selection.ts` + testes
- [ ] Implementar `useKanban2Columns.ts` + testes
- [ ] Todos os testes passando
- [ ] TypeScript strict sem erros
- [ ] Lint sem erros

### Validação
- [ ] Nenhuma race condition
- [ ] Nenhum memory leak
- [ ] 80%+ test coverage
- [ ] Código limpo e legível
- [ ] Documentação completa

---

## 💡 Dicas Importantes

1. **Responsabilidade Única** - Cada composable faz UMA coisa bem
2. **Readonly Exports** - Previne mutações acidentais
3. **Testes Primeiro** - Escrever testes enquanto desenvolve
4. **Type Safety** - Sempre usar tipos explícitos
5. **Sem Side Effects** - Composables devem ser puros
6. **Documentação** - Comentar lógica complexa
7. **Performance** - Usar `readonly()` para otimizar re-renders

---

## 🎓 Referências

- [Nuxt 4 Docs](https://nuxt.com)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/)
- [Supabase Docs](https://supabase.com/docs)

---

## 📞 Próximos Passos

1. ✅ Ler este steering file
2. ✅ Criar estrutura de pastas
3. ✅ Implementar Fase 1 (Composables)
4. ⏳ Implementar Fase 2 (Componentes)
5. ⏳ Implementar Fase 3 (Page)
6. ⏳ Implementar Fase 4 (Testes)
7. ⏳ Comparar com tarefas.vue

**Vamos começar! 🚀**
