# Funcionalidade de Transferência em Lote - Kanban

## 📋 Visão Geral

A funcionalidade de transferência em lote permite que você selecione múltiplos cards no kanban e os transfira para uma coluna diferente em uma única ação, economizando tempo em operações repetitivas.

## 🎯 Como Usar

### 1. **Selecionar Cards**
- Clique no checkbox no canto superior esquerdo de cada card para selecioná-lo
- Os cards selecionados exibem um anel verde ao redor deles
- Você pode selecionar quantos cards quiser

### 2. **Abrir a Barra de Ações**
Quando há cards selecionados, uma barra flutuante aparece na parte inferior da tela com as seguintes opções:

- **Transferir** - Move os cards selecionados para outra coluna
- **Deletar** - Remove os cards selecionados (com confirmação)
- **Limpar** - Deseleciona todos os cards

### 3. **Transferir para Coluna**
1. Clique no botão "Transferir" na barra de ações
2. Um modal aparecerá mostrando todas as colunas disponíveis
3. Selecione a coluna de destino
4. Clique em "Transferir"
5. Os cards serão movidos com animações suaves

## 🏗️ Arquitetura

### Componentes Criados

#### `KBulkActionsBar.vue`
Barra flutuante que aparece quando há cards selecionados. Oferece ações rápidas:
- Transferir para coluna
- Deletar selecionadas
- Limpar seleção

**Props:**
- `selectedCount: number` - Quantidade de cards selecionados

**Eventos:**
- `@transfer` - Abre o modal de transferência
- `@delete` - Deleta os cards selecionados
- `@clear` - Limpa a seleção

#### `KBulkTransferModal.vue`
Modal para selecionar a coluna de destino. Mostra:
- Lista de todas as colunas
- Quantidade de tarefas em cada coluna
- Indicador visual da coluna selecionada

**Props:**
- `isOpen: boolean` - Controla visibilidade do modal
- `selectedTaskIds: string[]` - IDs dos cards selecionados
- `columns: any[]` - Lista de colunas disponíveis
- `tasks: Task[]` - Lista de todas as tarefas
- `getTasksInColumn: (columnId: string) => Task[]` - Função para obter tarefas de uma coluna

**Eventos:**
- `@close` - Fecha o modal
- `@transfer` - Emite quando o usuário confirma a transferência

### Composables

#### `useBulkTaskTransfer.ts`
Gerencia o estado do modal de transferência:
- `isBulkTransferModalOpen` - Estado do modal
- `openBulkTransferModal()` - Abre o modal
- `closeBulkTransferModal()` - Fecha o modal

#### `useTaskSelection.ts` (existente)
Gerencia a seleção de cards:
- `selectedTaskIds` - Set com IDs selecionados
- `toggleTaskSelection(taskId)` - Alterna seleção
- `isTaskSelected(taskId)` - Verifica se está selecionado
- `getSelectedTaskIds()` - Retorna array de IDs
- `deselectAll()` - Limpa seleção

## 🔄 Fluxo de Dados

```
KTaskCard (checkbox)
    ↓
@select event
    ↓
KTasksKanbanViewContainer
    ↓
toggleTaskSelection() [useTaskSelection]
    ↓
selectedTaskIds atualizado
    ↓
KBulkActionsBar renderiza com selectedCount
    ↓
Usuário clica "Transferir"
    ↓
openBulkTransferModal()
    ↓
KBulkTransferModal abre
    ↓
Usuário seleciona coluna e confirma
    ↓
@transfer event com (columnId, taskIds)
    ↓
handleBulkTransfer() executa transição
    ↓
executeFullTransition() para cada task
    ↓
deselectAll() limpa seleção
    ↓
closeBulkTransferModal() fecha modal
```

## 🎨 Estilos e Animações

### Barra de Ações
- Aparece com animação slide-up quando há seleção
- Desaparece suavemente quando seleção é limpa
- Posicionada no bottom-center da tela
- Botões com cores temáticas (azul para transferir, vermelho para deletar)

### Modal de Transferência
- Animação fade-in ao abrir
- Lista de colunas com scroll
- Indicador visual da coluna selecionada (anel verde)
- Botão de transferência desabilitado até selecionar coluna

### Cards Selecionados
- Anel verde ao redor do card
- Animação pulse sutil
- Checkbox visível no canto superior esquerdo

## 📊 Casos de Uso

### 1. **Mover Tarefas Concluídas**
- Selecione todas as tarefas concluídas
- Transfira para coluna "Concluído"
- Economiza cliques individuais

### 2. **Reorganizar Prioridades**
- Selecione tarefas de baixa prioridade
- Transfira para coluna "Backlog"
- Mantém foco nas tarefas importantes

### 3. **Limpeza em Lote**
- Selecione tarefas antigas/obsoletas
- Clique "Deletar"
- Confirme a exclusão

### 4. **Atribuição de Sprint**
- Selecione tarefas para o próximo sprint
- Transfira para coluna "Sprint Atual"
- Prepara o sprint rapidamente

## 🚀 Melhorias Futuras

Baseado no documento `kanban-improvements.md`, possíveis expansões:

1. **Atribuição em Lote**
   - Atribuir múltiplas tarefas a um usuário
   - Adicionar tags em lote

2. **Duplicação em Lote**
   - Duplicar tarefas selecionadas
   - Útil para criar templates

3. **Exportação**
   - Exportar tarefas selecionadas (CSV/PDF)
   - Relatórios customizados

4. **Atalhos de Teclado**
   - `Ctrl+A` - Selecionar todas na coluna
   - `Ctrl+Shift+A` - Selecionar todas no kanban
   - `Delete` - Deletar selecionadas

## 🔧 Integração com Componentes Existentes

### KTaskCard.vue
- Checkbox de seleção já implementado
- Emite evento `@select` com taskId
- Exibe anel verde quando selecionado

### KTasksKanbanViewContainer.vue
- Gerencia estado de seleção
- Coordena transferência em lote
- Executa transições animadas

### useAdvancedTransitions.ts
- `executeFullTransition()` move a tarefa
- Mantém animações suaves
- Sincroniza com banco de dados

## 📝 Notas Técnicas

### Performance
- Seleção usa Set para O(1) lookup
- Transferência é sequencial com delays
- Animações não bloqueiam UI

### Reatividade
- Usa `useTaskSelection` composable
- Integrado com sistema de transições
- Sincroniza com Supabase em tempo real

### Acessibilidade
- Checkboxes nativos do HTML
- Botões com títulos descritivos
- Confirmação para ações destrutivas

## 🐛 Troubleshooting

### Cards não aparecem selecionados
- Verifique se o checkbox está marcado
- Confirme que `isTaskSelected()` retorna true
- Verifique console para erros

### Transferência não funciona
- Confirme que a coluna de destino existe
- Verifique se há permissões RLS no Supabase
- Veja console para erros de transição

### Barra de ações não aparece
- Confirme que há cards selecionados
- Verifique se `selectedCount > 0`
- Limpe cache do navegador

## 📚 Referências

- `app/components/tasks/KBulkActionsBar.vue`
- `app/components/tasks/KBulkTransferModal.vue`
- `app/composables/useBulkTaskTransfer.ts`
- `app/composables/useTaskSelection.ts`
- `app/components/tasks/KTasksKanbanViewContainer.vue`
