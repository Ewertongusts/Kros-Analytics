# Card Flashing on Drop - FIXED ✅

## Problema Original
Quando um card era movido entre colunas, ele **piscava** na coluna original antes de aparecer na coluna de destino. O problema era mais evidente quando o movimento era **muito rápido**.

## Root Cause
**Race condition** no fluxo de drop:

1. `startExiting()` marcava o card como "exiting"
2. `handleDrop()` atualizava `column_id` IMEDIATAMENTE (síncrono)
3. Vue ainda NÃO tinha re-renderizado
4. O card aparecia na coluna original porque `column_id` foi atualizado mas `isExiting()` ainda era true
5. Depois Vue re-renderizava e o card desaparecia
6. Finalmente `startEntering()` renderizava na nova coluna

## Solução Implementada

### 1. Usar `nextTick()` para Garantir Re-renderização
```typescript
// ANTES (race condition)
startExiting(task.id, fromColumnId)
handleDrop(e, targetColumnId, moveTask)  // ❌ Pode ser chamado antes de Vue re-renderizar

// DEPOIS (garantido)
startExiting(task.id, fromColumnId)
await nextTick()  // ✅ Garante que Vue re-renderizou
handleDrop(e, targetColumnId, moveTask)  // Agora é seguro
```

### 2. Filtrar Cards em Estado "Exiting"
```typescript
const getTasksInColumn = (columnId: string) => {
  return handlerTasks.value
    .filter(t => t.column_id === columnId && !isExiting(t.id!))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}
```

Quando um card está em estado "exiting", ele não é renderizado na coluna original.

### 3. Adicionar Classes CSS para Transições
```css
/* Card saindo da coluna original - DEVE FICAR INVISÍVEL */
.card-exiting {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
  transform: scale(0.95) translateY(-5px) !important;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Card entrando na coluna de destino - Animação suave */
.card-entering {
  animation: card-enter 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* Card se acomodando na posição final */
.card-settling {
  animation: card-settle 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
```

### 4. Melhorar Detecção de Posição
Aumentado o threshold de detecção de "acima" de 50% para 35% do topo do card:
```typescript
// ANTES (muito rigoroso)
const midpoint = rect.top + (rect.height / 2)

// DEPOIS (mais generoso)
const threshold = rect.top + (rect.height * 0.35)
```

Isso permite que a coluna de destino "atraia" melhor o card.

## Fluxo Final (Sem Piscar)

```
1. startExiting(task.id) 
   ↓ marca como exiting
2. await nextTick()
   ↓ Vue re-renderiza, getTasksInColumn() filtra o card
3. handleDrop()
   ↓ atualiza column_id
4. await 100ms
   ↓ DOM atualiza
5. executeFullTransition()
   ↓ animações avançadas
6. startEntering()
   ↓ renderiza na nova coluna com animação
7. startSettling()
   ↓ acomoda na posição final
```

## Resultado
✅ **Sem piscar** mesmo em drops muito rápidos
✅ Card desaparece suavemente da coluna original
✅ Aparece com animação na coluna de destino
✅ Melhor UX em geral

## Files Modificados
- `app/pages/tarefas.vue` - Adicionado `nextTick`, melhorado fluxo de drop
- `app/composables/useTaskDragDrop.ts` - Aumentado threshold de detecção
- `app/components/tasks/drag-animations.css` - Adicionadas classes de transição
- `app/composables/useRealtimeCardTransitions.ts` - Corrigido SSR issue

## Commits
1. `26ca758` - Fix: Card flashing on drop - Improved timing
2. `39b21c3` - Fix: Card flashing on fast drop - Use nextTick for guaranteed re-render
3. `5a2c2b4` - Clean: Remove debug logs from drop handler

## Testing
Para verificar que o fix funciona:
1. Abra a página de tarefas
2. Mova um card entre colunas **muito rápido**
3. Verifique que o card **não pisca** na coluna original
4. O card deve desaparecer suavemente e aparecer na coluna de destino com animação

## Key Takeaway
**Sempre use `nextTick()` quando precisar garantir que Vue re-renderizou antes de fazer operações síncronas que dependem do DOM estar atualizado.**
