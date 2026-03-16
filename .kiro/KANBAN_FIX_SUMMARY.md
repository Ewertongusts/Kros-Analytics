# Kanban Tasks Missing - Fix Summary

## 🎯 Problema Identificado

Tarefas estavam desaparecendo do kanban mesmo estando presentes em outras visualizações (list, grid, calendar).

## 🔍 Root Cause

**Erro crítico na comparação de campos:**

```typescript
// ❌ ERRADO
const filtered = handlerTasks.value.filter(t => 
  t.status === column.status  // Comparava status com status
)
```

### Por que era errado?

Tarefas têm **dois campos** relacionados a coluna:
- `task.status` → 'todo' | 'in_progress' | 'done' (tipo de status)
- `task.column_id` → ID único da coluna (ex: 'col_todo', 'col_custom_123')

Colunas também têm **dois campos**:
- `column.status` → 'todo' | 'in_progress' | 'done' (tipo)
- `column.column_id` → ID único (ex: 'col_todo', 'col_custom_123')

**O problema:** Tarefas criadas sem `column_id` tinham `column_id = null`, então nunca eram encontradas.

## ✅ Correções Implementadas

### 1. **app/pages/tarefas.vue**

#### Corrigir `getTasksInColumn`
```typescript
// ✅ CORRETO - Compara column_id com column_id
const getTasksInColumn = (columnId: string) => {
  const column = customColumns.value.find(c => c.column_id === columnId)
  
  if (!column) return []
  
  const filtered = handlerTasks.value
    .filter(t => {
      const columnMatch = t.column_id === columnId  // ← CORRETO!
      const notExiting = !isExiting(t.id!)
      return columnMatch && notExiting
    })
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  
  return filtered
}
```

#### Corrigir `orphanTasks`
```typescript
// ✅ CORRETO - Verifica column_id
const orphanTasks = computed(() => {
  const validColumnIds = customColumns.value.map(c => c.column_id)
  return handlerTasks.value.filter(t => 
    !validColumnIds.includes(t.column_id || '')
  )
})
```

#### Corrigir `handleTaskDragStart`
```typescript
// ✅ CORRETO - Usa columnId diretamente
const handleTaskDragStart = (task: Task, columnId: string) => {
  handleDragStart(task, columnId)
}
```

#### Adicionar logs detalhados
- `onMounted` - Mostra colunas e tarefas carregadas
- `getTasksInColumn` - Mostra cada tarefa e por que foi incluída/excluída
- `orphanTasks` - Mostra tarefas sem coluna válida

### 2. **app/composables/useKanbanColumns.ts**

#### Adicionar `migrateOrphanTasks`
```typescript
const migrateOrphanTasks = async () => {
  // Busca tarefas com column_id = null
  // Atribui column_id baseado no status
  // Exemplo: status='todo' → column_id='col_todo'
}
```

#### Adicionar `cleanupOrphanColumns`
```typescript
const cleanupOrphanColumns = async () => {
  // Deleta colunas com status inválido
}
```

#### Chamar migração no `fetchColumns`
```typescript
const fetchColumns = async () => {
  // ...
  await migrateOrphanTasks()  // ← Migra tarefas órfãs
  await initializeDefaultColumns()
  // ...
}
```

### 3. **app/composables/useTaskHandlers.ts**

Nenhuma mudança necessária - o `moveTask` já estava correto.

## 📊 Fluxo Correto Agora

```
1. Tarefa criada com column_id = 'col_todo'
   ↓
2. getTasksInColumn('col_todo') chamado
   ↓
3. Filtra: task.column_id === 'col_todo' ✅
   ↓
4. Tarefa aparece no kanban
```

## 🧪 Logs Adicionados

### onMounted
```
✅ [onMounted] Colunas carregadas:
   [0] "A Fazer" (id: col_todo, status: "todo", color: #ef4444)
   [1] "Em Progresso" (id: col_in_progress, status: "in_progress", color: #f59e0b)
   [2] "Concluído" (id: col_done, status: "done", color: #10b981)

✅ [onMounted] Tarefas carregadas:
   [0] "Tarefa 1" (id: abc123, status: "todo", position: 0)
   [1] "Tarefa 2" (id: def456, status: "in_progress", position: 0)

🔍 [onMounted] ANÁLISE DE COMPATIBILIDADE:
   Status válidos (das colunas): col_todo, col_in_progress, col_done
   Tarefa "Tarefa 1" - status: "todo" - ✅ VÁLIDO
   Tarefa "Tarefa 2" - status: "in_progress" - ✅ VÁLIDO
```

### getTasksInColumn
```
📊 [getTasksInColumn] Filtrando tarefas para coluna: "A Fazer"
   columnId: col_todo
   Total de tarefas no sistema: 5
   [0] "Tarefa 1" (id: abc123)
       - column_id: "col_todo" (esperado: "col_todo") - Match: true
       - isExiting: false - NotExiting: true
       - RESULTADO: ✅ INCLUÍDA
   📈 RESULTADO FINAL: 1 tarefas para coluna "A Fazer"
```

## 🔧 Próximos Passos

1. **Testar no navegador**
   - Abrir página de tarefas
   - Verificar console para logs
   - Confirmar que tarefas aparecem no kanban

2. **Migrar tarefas órfãs**
   - Executar `migrateOrphanTasks` automaticamente no `fetchColumns`
   - Ou executar SQL manualmente se necessário

3. **Adicionar validação no banco**
   - Adicionar constraint para garantir `column_id` nunca é null
   - Adicionar trigger para atribuir `column_id` padrão automaticamente

## 📝 Arquivos Modificados

- ✅ `app/pages/tarefas.vue` - Corrigir filtros e adicionar logs
- ✅ `app/composables/useKanbanColumns.ts` - Adicionar migração
- ✅ `app/composables/useTaskHandlers.ts` - Sem mudanças necessárias

## 📁 Arquivos de Referência

- `.kiro/KANBAN_TASKS_MISSING_FIX.md` - Análise detalhada
- `.kiro/MIGRATE_ORPHAN_TASKS.sql` - Script SQL para migração manual

## ✨ Resultado Esperado

Após essas mudanças:
- ✅ Tarefas aparecem no kanban
- ✅ Drag-drop funciona corretamente
- ✅ Tarefas órfãs aparecem em seção separada
- ✅ Logs mostram exatamente por que cada tarefa é incluída/excluída
- ✅ Novas tarefas recebem `column_id` automaticamente
