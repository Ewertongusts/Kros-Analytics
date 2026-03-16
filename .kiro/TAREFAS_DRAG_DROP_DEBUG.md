# Debug Drag & Drop - Página Tarefas

## 🎯 Como Usar os Logs

Os logs foram adicionados em **3 camadas** do fluxo de drag-drop:

### 1. **Composable `useTaskDragDrop`** - Gerencia estado
- `[TASK-DRAG-DROP]` - Logs do composable

### 2. **Página `tarefas.vue`** - Orquestra o movimento
- `[TAREFAS-PAGE]` - Logs da página

### 3. **Composable `useTaskHandlers`** - Executa a ação
- `[TASK-HANDLERS]` - Logs do handler (se adicionado)

---

## 📊 Fluxo Esperado de Logs

Quando você arrasta um card de uma coluna para outra:

```
1. [TASK-DRAG-DROP] 🚀 handleDragStart
   └─ Inicia o drag

2. [TASK-DRAG-DROP] 📍 handleDragOver (múltiplas vezes)
   └─ Detecta posição durante o arrasto

3. [TAREFAS-PAGE] 💧 handleTaskDropWithPosition START
   └─ Inicia o drop

4. [TAREFAS-PAGE] 📤 Task data parsed
   └─ Valida os dados da tarefa

5. [TAREFAS-PAGE] 🔄 Different column - starting animation sequence
   └─ Inicia animação de saída

6. [TAREFAS-PAGE] 📍 Calling moveTask
   └─ Chama a função de movimento

7. [TAREFAS-PAGE] ✅ moveTask called
   └─ Movimento iniciado

8. [TASK-DRAG-DROP] 🏁 handleDragEnd
   └─ Finaliza o drag
```

---

## 🔍 Como Abrir os Logs

### Passo 1: Abrir DevTools
- Pressione `F12` ou `Ctrl+Shift+I`
- Vá para a aba **Console**

### Passo 2: Filtrar Logs
No console, você pode filtrar por:
- `[TASK-DRAG-DROP]` - Composable
- `[TAREFAS-PAGE]` - Página
- `[TASK-HANDLERS]` - Handler

### Passo 3: Reproduzir o Problema
1. Abra a página de tarefas
2. Arraste um card de uma coluna para outra
3. Observe os logs no console

---

## 🐛 Problema: Card Não Fica na Posição Correta

### Checklist de Debug

- [ ] **Verificar se drag inicia:**
  - Procure por `[TASK-DRAG-DROP] 🚀 handleDragStart`
  - Se não aparecer, o drag não foi iniciado

- [ ] **Verificar se drag over funciona:**
  - Procure por `[TASK-DRAG-DROP] 📍 handleDragOver`
  - Verifique se `dragOverTaskId` e `dragOverPosition` estão corretos

- [ ] **Verificar se drop é acionado:**
  - Procure por `[TAREFAS-PAGE] 💧 handleTaskDropWithPosition START`
  - Se não aparecer, o drop não foi acionado

- [ ] **Verificar dados da tarefa:**
  - Procure por `[TAREFAS-PAGE] 📤 Task data parsed`
  - Verifique se `taskId`, `fromColumnId`, `targetColumnId` estão corretos

- [ ] **Verificar se moveTask foi chamada:**
  - Procure por `[TAREFAS-PAGE] 📍 Calling moveTask`
  - Verifique os parâmetros passados

- [ ] **Verificar se drag terminou:**
  - Procure por `[TASK-DRAG-DROP] 🏁 handleDragEnd`
  - Se não aparecer, o estado pode não ter sido resetado

---

## 📝 Exemplo de Logs Esperados

### Quando tudo funciona:

```
[TASK-DRAG-DROP] 🚀 handleDragStart
  taskId: "task-123"
  taskTitle: "Implementar feature X"
  source: "todo"

[TASK-DRAG-DROP] 📍 handleDragOver
  taskId: "task-456"
  newPosition: "below"
  draggedTaskId: "task-123"

[TAREFAS-PAGE] 💧 handleTaskDropWithPosition START
  targetColumnId: "in_progress"

[TAREFAS-PAGE] 📤 Task data parsed
  taskId: "task-123"
  fromColumnId: "todo"
  targetColumnId: "in_progress"
  sameColumn: false

[TAREFAS-PAGE] 🔄 Different column - starting animation sequence

[TAREFAS-PAGE] 📍 Calling moveTask
  taskId: "task-123"
  fromColumnId: "todo"
  targetColumnId: "in_progress"

[TAREFAS-PAGE] ✅ moveTask called

[TASK-DRAG-DROP] 🏁 handleDragEnd
  draggedTaskId: "task-123"
```

---

## ⚠️ Problemas Comuns

### Problema 1: Logs não aparecem
**Solução:**
- Verifique se o console está aberto (F12)
- Verifique se está na página correta (tarefas.vue)
- Recarregue a página (Ctrl+R)

### Problema 2: Drag inicia mas drop não funciona
**Solução:**
- Procure por `[TAREFAS-PAGE] ⚠️ Already processing drop`
- Isso significa que o drop anterior ainda está sendo processado
- Aguarde alguns segundos e tente novamente

### Problema 3: Task data parsed não aparece
**Solução:**
- Procure por `[TAREFAS-PAGE] ⚠️ No dragged task data found`
- Isso significa que os dados não foram passados corretamente
- Verifique se o drag foi iniciado corretamente

### Problema 4: moveTask não é chamada
**Solução:**
- Procure por `[TAREFAS-PAGE] ℹ️ Same column - just reordering`
- Se aparecer, significa que você está movendo na mesma coluna
- Verifique se `fromColumnId` e `targetColumnId` são diferentes

---

## 🎯 Próximos Passos

1. **Abra DevTools** (F12)
2. **Vá para Console**
3. **Arraste um card** de uma coluna para outra
4. **Copie os logs** que aparecem
5. **Compartilhe comigo** para análise

---

## 📌 Dica Importante

Se o card não fica na posição correta após mover, procure especificamente por:

```
[TAREFAS-PAGE] 📍 Calling moveTask
```

Verifique os parâmetros:
- `taskId` - ID da tarefa
- `fromColumnId` - Coluna de origem
- `targetColumnId` - Coluna de destino
- `dragOverTaskId` - ID da tarefa alvo (para posicionamento)
- `dragOverPosition` - Posição relativa (above/below)

Se `dragOverTaskId` ou `dragOverPosition` estiverem `null` ou `undefined`, o card pode não estar sendo posicionado corretamente.

