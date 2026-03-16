# 🐛 Drag-Drop Debugging Guide

## 🎯 Problema Recente Fixado

**Problema:** Cards não ficavam na posição exata onde eram soltos entre colunas

**Causa:** `@dragend` event limpava o estado (`dragOverTaskId`, `dragOverPosition`) ANTES de `moveTask()` usar

**Solução:** 
1. Remover `@dragend` handler dos cards
2. Chamar `handleDragEnd()` APÓS `moveTask()` completar

## 🔍 Como Debugar

### Step 1: Abrir DevTools Console
- Pressione `F12` ou `Ctrl+Shift+I`
- Vá para aba "Console"

### Step 2: Filtrar Logs
Use um dos filtros abaixo:

```
[TAREFAS-PAGE]    # Eventos da página
[TASK-DRAG-DROP]  # Estado de drag-drop
[MOVE-TASK]       # Movimento de tarefas
```

### Step 3: Fazer o Teste

1. **Teste 1: Reordenar na mesma coluna**
   - Arraste um card para cima/baixo na mesma coluna
   - Solte sobre outro card
   - Verifique logs

2. **Teste 2: Mover entre colunas**
   - Arraste um card de uma coluna para outra
   - Solte sobre um card específico
   - Verifique logs

3. **Teste 3: Mover para espaço vazio**
   - Arraste um card para outra coluna
   - Solte em espaço vazio (não sobre outro card)
   - Card deve ir para o final da coluna

## 📊 Fluxo Esperado

### Sucesso: Cross-Column Move
```
[TAREFAS-PAGE] 💧 handleTaskDropWithPosition START
[TAREFAS-PAGE] 📤 Task data parsed
[TAREFAS-PAGE] 🔄 Different column - starting animation sequence
[TAREFAS-PAGE] 📍 About to call moveTask with captured positioning
  ↓ dragOverTaskId: '175d42c1-a03d-4e09-b761-035aed0ee679'
  ↓ dragOverPosition: 'above'
[MOVE-TASK] 🚀 moveTask CALLED
[MOVE-TASK] 📍 Task found
[MOVE-TASK] 🔍 Analyzing move
[MOVE-TASK] 📌 Using target task positioning
[MOVE-TASK] ✅ Position calculated from target
  ↓ targetTaskPosition: 15
  ↓ newPosition: 15
[MOVE-TASK] 💾 Updating local state
[MOVE-TASK] 🔄 Persisting to database
[MOVE-TASK] ✅ Database update successful
[TAREFAS-PAGE] 🏁 Calling handleDragEndWithScroll after cross-column move
[TASK-DRAG-DROP] 🏁 handleDragEnd CALLED
[TASK-DRAG-DROP] ✅ Drag ended - state reset
```

## ✅ O Que Procurar

### Bons Sinais
- ✅ `dragOverTaskId` tem um valor (não é null)
- ✅ `dragOverPosition` é 'above' ou 'below'
- ✅ `Position calculated from target` aparece
- ✅ `Database update successful` aparece
- ✅ Nenhuma mensagem de erro `❌`

### Maus Sinais
- ❌ `dragOverTaskId: null` quando moveTask é chamado
- ❌ `dragOverPosition: null` quando moveTask é chamado
- ❌ `Database update failed` aparece
- ❌ Múltiplas mensagens de erro
- ❌ `Already processing drop, ignoring` aparece

## 🔧 Troubleshooting

### Problema 1: Card vai para o final da coluna
```
[TAREFAS-PAGE] 📍 About to call moveTask with captured positioning
  ↓ capturedDragOverTaskId: null
  ↓ capturedDragOverPosition: null
```

**Solução:** Você soltou em espaço vazio. Solte **sobre** um card específico.

### Problema 2: Card desaparece
```
[MOVE-TASK] ❌ Database update failed
```

**Solução:** 
- Verificar conexão com banco de dados
- Verificar Supabase logs
- Verificar se task existe no banco

### Problema 3: Animação não funciona
```
[TAREFAS-PAGE] ❌ Error during animation
```

**Solução:**
- Verificar console para JavaScript errors
- Verificar se CSS está carregado
- Verificar `drag-animations.css`

### Problema 4: Logs não aparecem
**Solução:**
- Abrir DevTools Console (F12)
- Limpar console (Ctrl+L)
- Fazer o teste novamente
- Procurar por `[TAREFAS-PAGE]` ou `[MOVE-TASK]`

## 📋 Checklist de Debugging

- [ ] DevTools Console aberto
- [ ] Filtro aplicado (`[TAREFAS-PAGE]` ou `[MOVE-TASK]`)
- [ ] Console limpo antes do teste
- [ ] Teste realizado (drag-drop)
- [ ] Logs aparecem
- [ ] Procurar por `dragOverTaskId` e `dragOverPosition`
- [ ] Verificar se são null ou têm valores
- [ ] Procurar por `Database update successful` ou `failed`
- [ ] Verificar se card ficou na posição correta

## 🎯 Casos de Teste

### Caso 1: Reordenar na mesma coluna
```
Ação: Arrastar Card A para cima de Card B (mesma coluna)
Esperado: Card A fica acima de Card B
Logs: [TAREFAS-PAGE] ℹ️ Same column - just reordering
```

### Caso 2: Mover entre colunas com target
```
Ação: Arrastar Card A de Coluna 1 para acima de Card X em Coluna 2
Esperado: Card A aparece acima de Card X em Coluna 2
Logs: [TAREFAS-PAGE] 🔄 Different column
      [MOVE-TASK] 📌 Using target task positioning
```

### Caso 3: Mover entre colunas sem target
```
Ação: Arrastar Card A de Coluna 1 para espaço vazio em Coluna 2
Esperado: Card A vai para o final de Coluna 2
Logs: [MOVE-TASK] 📌 Moving between columns without target
```

## 💡 Dicas Profissionais

1. **Copiar logs para análise**
   - Selecionar logs relevantes
   - Copiar (Ctrl+C)
   - Colar em arquivo de texto

2. **Comparar com fluxo esperado**
   - Usar este documento como referência
   - Procurar por desvios

3. **Usar timestamps**
   - Cada log tem timestamp
   - Procurar por gaps grandes (pode indicar delay)

4. **Monitorar database**
   - Abrir Supabase dashboard
   - Verificar se task foi atualizada
   - Comparar position e column_id

## 📞 Próximos Passos

Se o problema persistir:
1. Coletar todos os logs
2. Verificar Supabase logs
3. Verificar browser network tab
4. Procurar por JavaScript errors
5. Verificar se CSS está carregado

---

**Última atualização:** 2026-03-16
