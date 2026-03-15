# 🔍 Guia de Debug - Animações de Tarefas

## Como Testar as Animações

### 1. **Abrir DevTools**
- Pressione `F12` ou `Ctrl+Shift+I`
- Vá para a aba "Console"

### 2. **Criar Tarefas de Teste**
- Clique em "+ NOVA TAREFA"
- Crie 2-3 tarefas na coluna "A Fazer"
- Exemplo:
  - Tarefa 1: "Teste de Animação"
  - Tarefa 2: "Outra Tarefa"

### 3. **Arrastar Tarefa Entre Colunas**
- Clique e segure em uma tarefa
- Arraste para a coluna "Em Andamento"
- Solte o mouse

### 4. **Observar Console**
Você deve ver logs como:

```
📤 Dispatching taskMove event: {
  taskId: "abc123",
  from: "todo",
  to: "in_progress"
}

🎬 Animation triggered: {
  taskId: "abc123",
  from: "todo",
  to: "in_progress"
}

🎬 startMove called: {
  taskId: "abc123",
  from: "todo",
  to: "in_progress"
}

🎬 Animation class applied: {
  taskId: "abc123",
  columnStatus: "todo",
  animClass: "task-move-out"
}

🎬 Animation class applied: {
  taskId: "abc123",
  columnStatus: "in_progress",
  animClass: "task-move-in"
}

🎬 Animation reset
```

### 5. **Observar Animação Visual**
Você deve ver:
- ✅ Tarefa desaparece suavemente da coluna origem (fade-out + slide-left)
- ✅ Tarefa aparece suavemente na coluna destino (fade-in + slide-right)
- ✅ Duração: ~300ms

---

## Se NÃO Funcionar

### Problema 1: Nenhum log aparece
**Causa**: Evento não está sendo disparado
**Solução**:
1. Verifique se `dragSource.value !== targetStatus` é verdadeiro
2. Verifique se `draggedTask.value` existe
3. Tente arrastar para uma coluna DIFERENTE

### Problema 2: Logs aparecem mas sem animação visual
**Causa**: CSS não está sendo aplicado
**Solução**:
1. Abra DevTools → Aba "Elements"
2. Selecione o card da tarefa
3. Procure pela classe `task-move-out` ou `task-move-in`
4. Verifique se a classe está sendo aplicada

### Problema 3: Animação muito rápida ou muito lenta
**Causa**: Duração do timeout não corresponde ao CSS
**Solução**:
- CSS: `animation: moveOut 0.3s ease-out forwards;`
- JS: `setTimeout(..., 300)` ← Deve ser igual
- Se mudar um, mude o outro também

---

## Checklist de Funcionamento

- [ ] Logs aparecem no console
- [ ] Evento `taskMove` é disparado
- [ ] `startMove()` é chamado
- [ ] Classes `task-move-out` e `task-move-in` são aplicadas
- [ ] Tarefa desaparece suavemente da origem
- [ ] Tarefa aparece suavemente no destino
- [ ] Animação dura ~300ms
- [ ] Tarefa é movida para a coluna correta no banco de dados

---

## Fluxo Completo

```
1. Usuário arrasta tarefa
   ↓
2. @dragstart emite evento 'dragstart'
   ↓
3. @drop chama handleDrop()
   ↓
4. handleDrop() dispara CustomEvent 'taskMove'
   ↓
5. window.addEventListener('taskMove') recebe evento
   ↓
6. startMove() ativa animação
   ↓
7. getTaskAnimationClass() retorna 'task-move-out' ou 'task-move-in'
   ↓
8. CSS anima a transição
   ↓
9. setTimeout() reseta estado após 300ms
   ↓
10. moveTask() atualiza banco de dados
```

---

## Próximas Melhorias

Se tudo funcionar, considere:
- [ ] Adicionar efeito de "bounce" ao entrar
- [ ] Adicionar feedback visual de "drop zone"
- [ ] Animar também a altura das colunas
- [ ] Adicionar som de sucesso (já existe)

---

**Status**: 🔍 Aguardando feedback do usuário
