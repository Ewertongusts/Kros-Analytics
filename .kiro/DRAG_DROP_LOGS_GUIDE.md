# Guia de Logs - Drag & Drop Kanban 2

## 📊 Fluxo Completo de Logs

Quando você arrasta um card de uma coluna para outra, os logs aparecem nesta ordem:

### 1️⃣ **CARD - Drag Start**
```
[CARD] 🎯 handleDragStart
  taskId: "task-123"
  taskTitle: "Implementar feature X"
  columnId: "col-1"
  timestamp: "2024-03-16T10:30:45.123Z"

[CARD] 📤 Emitting drag-start event
  taskId: "task-123"
  columnId: "col-1"
```

### 2️⃣ **DRAG-DROP - Start Drag**
```
[DRAG-DROP] 🚀 START DRAG
  taskId: "task-123"
  taskTitle: "Implementar feature X"
  fromColumnId: "col-1"
  timestamp: "2024-03-16T10:30:45.124Z"

[DRAG-DROP] ✅ START DRAG STATE
  {
    isDragging: true,
    taskId: "task-123",
    fromColumnId: "col-1",
    toColumnId: null,
    position: null,
    isDropping: false
  }
```

### 3️⃣ **CARD - Drag Over (Múltiplas vezes enquanto arrasta)**
```
[CARD] 📍 handleDragOver
  taskId: "task-123"
  columnId: "col-2"
  position: "below"
  clientY: 450
  threshold: 440
  rectTop: 400
  rectHeight: 100
  timestamp: "2024-03-16T10:30:45.200Z"
```

### 4️⃣ **DRAG-DROP - Move Drag (Múltiplas vezes)**
```
[DRAG-DROP] 📍 MOVE DRAG
  taskId: "task-123"
  fromColumnId: "col-1"
  toColumnId: "col-2"
  position: "below"
  sameColumn: false
  timestamp: "2024-03-16T10:30:45.201Z"

[DRAG-DROP] ✅ MOVE DRAG STATE
  {
    isDragging: true,
    taskId: "task-123",
    fromColumnId: "col-1",
    toColumnId: "col-2",
    position: "below",
    isDropping: false
  }
```

### 5️⃣ **COLUMN - Drag Over**
```
[COLUMN] 📍 handleColumnDragOver
  columnId: "col-2"
  columnName: "Em Progresso"
  timestamp: "2024-03-16T10:30:45.300Z"
```

### 6️⃣ **CARD - Drop**
```
[CARD] 💧 handleDrop
  taskId: "task-123"
  taskTitle: "Implementar feature X"
  columnId: "col-2"
  timestamp: "2024-03-16T10:30:45.400Z"

[CARD] 📤 Emitting drop event
  taskId: "task-123"
  columnId: "col-2"
```

### 7️⃣ **COLUMN - Drop**
```
[COLUMN] 💧 handleColumnDrop
  columnId: "col-2"
  columnName: "Em Progresso"
  taskId: "task-123"
  timestamp: "2024-03-16T10:30:45.401Z"

[COLUMN] 📤 Emitting task-drop event
  columnId: "col-2"
  taskId: "task-123"
```

### 8️⃣ **BOARD - Drop Handler**
```
[BOARD] 💧 handleTaskDrop
  taskId: "task-123"
  taskTitle: "Implementar feature X"
  fromColumnId: "col-1"
  toColumnId: "col-2"
  sameColumn: false
  timestamp: "2024-03-16T10:30:45.402Z"

[BOARD] 🔄 Different column - moving task
```

### 9️⃣ **BOARD - Calling completeDrop**
```
[BOARD] 📤 Calling data.moveTask
  taskId: "task-123"
  fromCol: "col-1"
  toCol: "col-2"
  position: "below"
```

### 🔟 **MOVE-TASK - API Call**
```
[MOVE-TASK] 📤 Starting move
  taskId: "task-123"
  fromColumnId: "col-1"
  toColumnId: "col-2"
  position: "below"
  timestamp: "2024-03-16T10:30:45.403Z"

[MOVE-TASK] 🌐 Calling API /api/tasks/move
  taskId: "task-123"
  fromColumnId: "col-1"
  toColumnId: "col-2"
  position: "below"

[MOVE-TASK] ✅ API call successful

[MOVE-TASK] 🔄 Updating local state
  taskIndex: 5
  oldColumnId: "col-1"
  newColumnId: "col-2"

[MOVE-TASK] ✅ Local state updated
```

### 1️⃣1️⃣ **DRAG-DROP - Complete Drop**
```
[DRAG-DROP] 💾 COMPLETE DROP - Starting
  taskId: "task-123"
  fromColumnId: "col-1"
  toColumnId: "col-2"
  position: "below"
  timestamp: "2024-03-16T10:30:45.404Z"

[DRAG-DROP] 📤 COMPLETE DROP - Calling moveTaskFn
  taskId: "task-123"
  fromColumnId: "col-1"
  toColumnId: "col-2"
  position: "below"

[DRAG-DROP] ✅ COMPLETE DROP - Success

[DRAG-DROP] 🔄 COMPLETE DROP - Resetting state
```

### 1️⃣2️⃣ **DRAG-DROP - Reset**
```
[DRAG-DROP] 🔄 RESET DRAG
  previousState: {
    isDragging: true,
    taskId: "task-123",
    fromColumnId: "col-1",
    toColumnId: "col-2",
    position: "below",
    isDropping: true
  }
  timestamp: "2024-03-16T10:30:45.405Z"

[DRAG-DROP] ✅ RESET DRAG - Complete
  {
    isDragging: false,
    taskId: null,
    fromColumnId: null,
    toColumnId: null,
    position: null,
    isDropping: false
  }
```

### 1️⃣3️⃣ **CARD - Drag End**
```
[CARD] 🏁 handleDragEnd
  taskId: "task-123"
  timestamp: "2024-03-16T10:30:45.406Z"
```

### 1️⃣4️⃣ **BOARD - Success**
```
[BOARD] ✅ data.moveTask completed
[BOARD] ✅ Drop completed successfully
```

---

## 🔍 Como Ler os Logs

### Abrir DevTools
1. Pressione `F12` ou `Ctrl+Shift+I`
2. Vá para a aba **Console**
3. Procure por logs que começam com `[DRAG-DROP]`, `[CARD]`, `[COLUMN]`, `[BOARD]`, `[MOVE-TASK]`

### Filtrar Logs
No console, você pode filtrar por:
- `[DRAG-DROP]` - Logs do composable de drag-drop
- `[CARD]` - Logs do componente do card
- `[COLUMN]` - Logs do componente da coluna
- `[BOARD]` - Logs do componente do board
- `[MOVE-TASK]` - Logs da API de movimento

### Exemplo de Filtro
```javascript
// No console, digite:
console.log = (function(original) {
  return function(...args) {
    if (args[0]?.includes?.('[DRAG-DROP]')) {
      original.apply(console, args)
    }
  }
})(console.log)
```

---

## 🐛 Problemas Comuns

### Problema: Card não fica na posição correta após mover
**O que procurar nos logs:**

1. ✅ Verificar se `[MOVE-TASK] ✅ API call successful` aparece
2. ✅ Verificar se `[MOVE-TASK] ✅ Local state updated` aparece
3. ✅ Verificar se `[DRAG-DROP] ✅ COMPLETE DROP - Success` aparece
4. ✅ Verificar se `[DRAG-DROP] ✅ RESET DRAG - Complete` aparece

Se algum desses não aparecer, o problema está naquele ponto.

### Problema: Drag não inicia
**O que procurar nos logs:**

1. Verificar se `[CARD] 🎯 handleDragStart` aparece
2. Verificar se `[DRAG-DROP] 🚀 START DRAG` aparece
3. Se não aparecer, o evento de drag não foi disparado

### Problema: Drop não funciona
**O que procurar nos logs:**

1. Verificar se `[CARD] 💧 handleDrop` aparece
2. Verificar se `[COLUMN] 💧 handleColumnDrop` aparece
3. Verificar se `[BOARD] 💧 handleTaskDrop` aparece
4. Se não aparecer, o evento de drop não foi disparado

### Problema: API retorna erro
**O que procurar nos logs:**

1. Procurar por `[MOVE-TASK] ❌ Error`
2. Ver a mensagem de erro
3. Verificar se o `taskId`, `fromColumnId`, `toColumnId` estão corretos

---

## 📝 Checklist de Debugging

Quando o card não fica na posição correta:

- [ ] Abrir DevTools (F12)
- [ ] Ir para Console
- [ ] Arrastar um card de uma coluna para outra
- [ ] Procurar por `[DRAG-DROP] 🚀 START DRAG` - verificar taskId e fromColumnId
- [ ] Procurar por `[DRAG-DROP] 📍 MOVE DRAG` - verificar toColumnId e position
- [ ] Procurar por `[MOVE-TASK] 🌐 Calling API` - verificar parâmetros
- [ ] Procurar por `[MOVE-TASK] ✅ API call successful` - verificar se API respondeu
- [ ] Procurar por `[MOVE-TASK] 🔄 Updating local state` - verificar se estado foi atualizado
- [ ] Procurar por `[DRAG-DROP] ✅ COMPLETE DROP - Success` - verificar se drop completou
- [ ] Procurar por `[DRAG-DROP] ✅ RESET DRAG - Complete` - verificar se estado foi resetado

Se todos os logs aparecerem na ordem correta, o problema pode estar:
1. Na renderização do Vue (verificar se o card está sendo re-renderizado)
2. Na API (verificar se o banco de dados foi atualizado)
3. Na reatividade (verificar se `tasks.value` está sendo atualizado corretamente)

---

## 🎯 Próximos Passos

1. Abra o kanban2
2. Abra DevTools (F12)
3. Vá para Console
4. Arraste um card de uma coluna para outra
5. Verifique os logs
6. Compartilhe os logs comigo para análise

