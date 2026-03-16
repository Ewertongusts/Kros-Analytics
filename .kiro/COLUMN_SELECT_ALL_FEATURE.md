# Feature: Select All Cards in Column

## Overview
Adicionada funcionalidade para marcar/desmarcar todos os cards de uma coluna com um único clique. O checkbox aparece no header da coluna quando há pelo menos um card selecionado.

## Changes Made

### 1. `app/composables/useTaskSelection.ts`
Adicionadas novas funções para gerenciar seleção em nível de coluna:

```typescript
// Seleciona todos os cards de uma coluna
selectColumnTasks(taskIds: string[])

// Desseleciona todos os cards de uma coluna
deselectColumnTasks(taskIds: string[])

// Toggle: seleciona ou desseleciona todos os cards da coluna
toggleColumnTasks(taskIds: string[])

// Verifica se todos os cards da coluna estão selecionados
isColumnFullySelected(taskIds: string[]): boolean

// Verifica se alguns (mas não todos) cards da coluna estão selecionados
isColumnPartiallySelected(taskIds: string[]): boolean
```

### 2. `app/pages/tarefas.vue`

#### Template Changes
- Adicionado checkbox no header de cada coluna
- Checkbox aparece apenas quando `selectedCount > 0`
- Substitui o ícone de drag handle quando há seleções
- Mostra estado: totalmente selecionado, parcialmente selecionado ou vazio

```vue
<!-- Checkbox Select All (aparece quando há seleções) -->
<input
  v-if="selectedCount > 0"
  type="checkbox"
  :checked="isColumnFullySelected(getTasksInColumn(column.column_id).map(t => t.id!))"
  :indeterminate="isColumnPartiallySelected(getTasksInColumn(column.column_id).map(t => t.id!))"
  @click.stop="toggleColumnTasks(getTasksInColumn(column.column_id).map(t => t.id!))"
  class="w-4 h-4 rounded-md cursor-pointer appearance-none transition-all flex-shrink-0"
  :style="getColumnCheckboxStyle(column.column_id)"
/>
```

#### Script Changes
- Importadas novas funções do composable
- Adicionada função `getColumnCheckboxStyle()` para estilizar o checkbox
- Checkbox usa a cor whitelabel `--kros-blue` quando selecionado
- Suporta estado indeterminado (parcialmente selecionado)

```typescript
const getColumnCheckboxStyle = (columnId: string) => {
  const checkmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`
  const encodedSvg = encodeURIComponent(checkmarkSvg)
  const isFullySelected = isColumnFullySelected(getTasksInColumn(columnId).map(t => t.id!))
  const isPartiallySelected = isColumnPartiallySelected(getTasksInColumn(columnId).map(t => t.id!))
  
  return {
    backgroundColor: isFullySelected ? 'var(--kros-blue, #3b82f6)' : isPartiallySelected ? 'var(--kros-blue, #3b82f6)' : 'transparent',
    border: isFullySelected || isPartiallySelected ? 'none' : '2px solid rgba(255, 255, 255, 0.3)',
    backgroundImage: isFullySelected || isPartiallySelected ? `url('data:image/svg+xml,${encodedSvg}')` : 'none',
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: isPartiallySelected ? '0.6' : '1'
  }
}
```

## Behavior

### When No Cards Are Selected
- Ícone de drag handle é exibido no header da coluna
- Checkbox não aparece

### When At Least One Card Is Selected
- Checkbox aparece no lugar do ícone de drag handle
- **Totalmente Selecionado**: Checkbox azul com checkmark
- **Parcialmente Selecionado**: Checkbox azul com checkmark e opacidade 0.6
- **Nenhum Selecionado**: Checkbox vazio com borda branca

### Interactions
1. Clique no checkbox para selecionar/desselecionar todos os cards da coluna
2. Se todos estão selecionados → clique desseleciona todos
3. Se nenhum está selecionado → clique seleciona todos
4. Se alguns estão selecionados → clique seleciona todos

## Styling
- Checkbox: 4x4 (w-4 h-4)
- Cor: `--kros-blue` (whitelabel)
- Checkmark: SVG branco
- Estado parcial: opacidade 60%
- Transição suave: `transition-all`

## Testing Checklist
- [ ] Abrir página de tarefas
- [ ] Selecionar um card (checkbox aparece no header)
- [ ] Clicar no checkbox da coluna para selecionar todos
- [ ] Verificar que todos os cards da coluna ficam selecionados
- [ ] Clicar novamente para desselecionar todos
- [ ] Selecionar alguns cards manualmente
- [ ] Verificar que checkbox fica em estado parcial (opacidade 60%)
- [ ] Clicar no checkbox parcial para selecionar todos
- [ ] Testar em múltiplas colunas
- [ ] Verificar que floating buttons funcionam com seleção em massa

## Files Modified
- `app/composables/useTaskSelection.ts` - Adicionadas funções de seleção por coluna
- `app/pages/tarefas.vue` - Adicionado checkbox no header da coluna
