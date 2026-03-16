# Kanban Tasks Missing - ROOT CAUSE & FIX

## 🎯 O Problema

Tarefas estavam desaparecendo do kanban mesmo estando presentes em outras visualizações (list, grid, calendar).

## 🔍 Root Cause Identificada

**Erro Crítico:** Comparação errada de campos

```typescript
// ❌ ERRADO - Comparava status com status
const filtered = handlerTasks.value.filter(t => {
  const statusMatch = t.status === column.status  // ← PROBLEMA!
  return statusMatch && notExiting
})
```

### Por que isso era errado?

1. **Tarefas têm dois campos relacionados a coluna:**
   - `task.status` → 'todo' | 'in_progress' | 'done' (campo padrão do banco)
   - `task.column_id` → ID único da coluna (ex: 'col_todo', 'col_custom_123')

2. **Colunas também têm dois campos:**
   - `column.status` → 'todo' | 'in_progress' | 'done' (tipo de coluna)
   - `column.column_id` → ID único (ex: 'col_todo', 'col_custom_123')

3. **O problema:**
   - Tarefas criadas SEM `column_id` tinham `column_id = null`
   - Colunas tinham `column.status = 'todo'` mas `column.column_id = 'col_todo'`
   - Comparação `task.status === column.status` funcionava por coincidência
   - Mas quando `task.column_id` era `null`, a tarefa não era encontrada

## ✅ Solução Implementada

### 1. Corrigir `getTasksInColumn` (tarefas.vue)

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

### 2. Corrigir `orphanTasks` (tarefas.vue)

```typescript
// ✅ CORRETO - Verifica column_id
const orphanTasks = computed(() => {
  const validColumnIds = customColumns.value.map(c => c.column_id)
  return handlerTasks.value.filter(t => 
    !validColumnIds.includes(t.column_id || '')
  )
})
```

### 3. Corrigir `handleTaskDragStart` (tarefas.vue)

```typescript
// ✅ CORRETO - Usa columnId diretamente
const handleTaskDragStart = (task: Task, columnId: string) => {
  handleDragStart(task, columnId)
}
```

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

## 🧪 Logs Detalhados Adicionados

Para debugar futuros problemas, adicionei logs em:

1. **onMounted** - Mostra colunas e tarefas carregadas
2. **getTasksInColumn** - Mostra cada tarefa e por que foi incluída/excluída
3. **orphanTasks** - Mostra tarefas sem coluna válida

Exemplo de log:
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

1. **Garantir que novas tarefas recebem `column_id`**
   - Verificar `BlocksKTaskModal` para garantir que `column_id` é salvo
   - Verificar `useTaskHandlers.handleSaveTask` para garantir que `column_id` é passado

2. **Migrar tarefas órfãs**
   - Tarefas com `column_id = null` devem ser atribuídas a uma coluna padrão
   - Executar script SQL para atualizar tarefas órfãs

3. **Adicionar validação no banco**
   - Adicionar constraint para garantir que `column_id` nunca é null
   - Adicionar trigger para atribuir `column_id` padrão automaticamente

## 📝 Checklist

- [x] Corrigir `getTasksInColumn` para usar `column_id`
- [x] Corrigir `orphanTasks` para usar `column_id`
- [x] Corrigir `handleTaskDragStart` para usar `columnId`
- [x] Adicionar logs detalhados para debugging
- [ ] Verificar `BlocksKTaskModal` para garantir `column_id` é salvo
- [ ] Migrar tarefas órfãs (column_id = null)
- [ ] Adicionar validação no banco de dados

## 🚀 Resultado Esperado

Após essas mudanças:
- ✅ Tarefas aparecem no kanban
- ✅ Drag-drop funciona corretamente
- ✅ Tarefas órfãs aparecem em seção separada
- ✅ Logs mostram exatamente por que cada tarefa é incluída/excluída
