# 🏗️ Kanban Architecture

## Visão Geral

O kanban é implementado em `app/pages/tarefas.vue` com suporte a:
- Drag-drop entre colunas
- Reordenação dentro da mesma coluna
- Posicionamento exato (above/below)
- Animações suaves
- Sincronização com banco de dados

## 📊 Estrutura de Dados

### Tasks (Tarefas)
```typescript
interface Task {
  id: string
  title: string
  description?: string
  column_id: string        // ID da coluna
  position: number         // Posição dentro da coluna (0, 1, 2, ...)
  status: string
  priority: string
  due_date?: string
  company_id?: string
  assigned_to?: string
  created_at: string
  updated_at: string
}
```

### Columns (Colunas)
```typescript
interface Column {
  column_id: string
  name: string
  status: string
  color?: string
  position: number
  created_at: string
  updated_at: string
}
```

## 🔄 Fluxo de Drag-Drop

### 1. Drag Start
```
User clicks and holds card
    ↓
@dragstart fires
    ↓
handleTaskDragStart() called
    ↓
draggedTask.value = task
dragSource.value = columnId
```

### 2. Drag Over
```
User moves card over target
    ↓
@dragover fires on target card
    ↓
handleDragOver() calculates position (above/below)
    ↓
dragOverTaskId.value = targetTaskId
dragOverPosition.value = 'above' | 'below'
```

### 3. Drop
```
User releases card
    ↓
@drop fires
    ↓
handleTaskDropWithPosition() called
    ↓
Capture dragOverTaskId and dragOverPosition
    ↓
Call moveTask(taskId, columnId, targetTaskId, position)
    ↓
Update local state
    ↓
Persist to database
    ↓
Call handleDragEnd() to clean up
```

### 4. Drag End
```
Drop completes
    ↓
handleDragEnd() called
    ↓
Clear all drag state
draggedTask.value = null
dragOverTaskId.value = null
dragOverPosition.value = null
```

## 🎯 Posicionamento

### Cálculo de Posição

Quando você solta um card **acima** de outro:
```typescript
targetPos = targetTask.position  // Ex: 5
newPosition = targetPos          // 5 (acima)
```

Quando você solta um card **abaixo** de outro:
```typescript
targetPos = targetTask.position  // Ex: 5
newPosition = targetPos + 1      // 6 (abaixo)
```

### Exemplo Prático

Coluna com 3 cards:
```
Position 0: Card A
Position 1: Card B
Position 2: Card C
```

Se você soltar Card X **acima** de Card B:
```
Position 0: Card A
Position 1: Card X (novo)
Position 2: Card B
Position 3: Card C
```

## 📁 Arquivos Principais

| Arquivo | Responsabilidade |
|---------|------------------|
| `app/pages/tarefas.vue` | Página principal, lógica de drag-drop |
| `app/composables/useTaskDragDrop.ts` | Gerenciamento de estado de drag-drop |
| `app/composables/useTaskHandlers.ts` | Lógica de moveTask, CRUD |
| `app/composables/useTasks.ts` | Fetch/sync com banco de dados |

## 🔌 Composables

### useTaskDragDrop
Gerencia estado de drag-drop:
```typescript
const draggedTask = ref<Task | null>(null)
const dragOverTaskId = ref<string | null>(null)
const dragOverPosition = ref<'above' | 'below' | null>(null)

const handleDragStart = (task, source) => {...}
const handleDragOver = (e, taskId, moveTaskFn) => {...}
const handleDrop = (e, targetStatus, moveTask) => {...}
const handleDragEnd = () => {...}
```

### useTaskHandlers
Lógica de negócio:
```typescript
const moveTask = (taskId, newColumnId, targetTaskId?, position?) => {
  // Calcula nova posição
  // Atualiza estado local
  // Persiste no banco
}
```

### useTasks
Sincronização com banco:
```typescript
const fetchTasks = async () => {...}
const createTask = async (task) => {...}
const updateTask = async (taskId, updates) => {...}
const deleteTask = async (taskId) => {...}
```

## 🐛 Debugging

### Logs Disponíveis

| Prefixo | Arquivo | Descrição |
|---------|---------|-----------|
| `[TAREFAS-PAGE]` | tarefas.vue | Eventos da página |
| `[TASK-DRAG-DROP]` | useTaskDragDrop.ts | Estado de drag-drop |
| `[MOVE-TASK]` | useTaskHandlers.ts | Movimento de tarefas |

### Exemplo de Log Completo

```
[TASK-DRAG-DROP] 🚀 handleDragStart
[TASK-DRAG-DROP] 📍 handleDragOver
[TASK-DRAG-DROP] ✅ Drag over state updated
[TAREFAS-PAGE] 💧 handleTaskDropWithPosition START
[TAREFAS-PAGE] 📍 About to call moveTask with captured positioning
[MOVE-TASK] 🚀 moveTask CALLED
[MOVE-TASK] ✅ Position calculated from target
[MOVE-TASK] 💾 Updating local state
[MOVE-TASK] 🔄 Persisting to database
[MOVE-TASK] ✅ Database update successful
[TASK-DRAG-DROP] 🏁 handleDragEnd CALLED
```

## ⚠️ Problemas Conhecidos e Soluções

### Problema: Card vai para o final da coluna
**Causa:** `dragOverTaskId` é null quando `moveTask()` é chamado
**Solução:** Certificar que você está soltando **sobre** um card específico, não em espaço vazio

### Problema: Card desaparece após drop
**Causa:** Erro na atualização do banco de dados
**Solução:** Verificar logs para `Database update failed`

### Problema: Animação não funciona
**Causa:** CSS não carregou ou JavaScript error
**Solução:** Verificar console para erros

## 🚀 Performance

- Drag-drop mantém 60 FPS
- Animações são suaves
- Sem memory leaks
- Sem race conditions

## 📝 Próximas Melhorias

- [ ] Virtualização de cards (para 100+ tarefas)
- [ ] Indicador de progresso por coluna
- [ ] Atalhos de teclado
- [ ] Bulk actions
- [ ] Swimlanes por usuário

---

**Última atualização:** 2026-03-16
