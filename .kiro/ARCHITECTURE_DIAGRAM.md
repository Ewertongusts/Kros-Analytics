# 🏗️ Arquitetura - Transferência em Lote

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    KTasksKanbanViewContainer                     │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Kanban Board                            │   │
│  │                                                            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │   Coluna 1   │  │   Coluna 2   │  │   Coluna 3   │   │   │
│  │  │              │  │              │  │              │   │   │
│  │  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │   │   │
│  │  │ │ Card ☑   │ │  │ │ Card     │ │  │ │ Card ☑   │ │   │   │
│  │  │ │ (seleção)│ │  │ │          │ │  │ │ (seleção)│ │   │   │
│  │  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │   │   │
│  │  │              │  │              │  │              │   │   │
│  │  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │   │   │
│  │  │ │ Card     │ │  │ │ Card ☑   │ │  │ │ Card     │ │   │   │
│  │  │ │          │ │  │ │ (seleção)│ │  │ │          │ │   │   │
│  │  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            KBulkActionsBar (Flutuante)                   │   │
│  │  ✓ 3 tarefas | [Transferir] [Deletar] [Limpar]          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         KBulkTransferModal (Modal)                       │   │
│  │  Transferir 3 tarefas                                    │   │
│  │  ○ Coluna 1 (5 tarefas)                                  │   │
│  │  ● Coluna 2 (2 tarefas) ← Selecionada                   │   │
│  │  ○ Coluna 3 (8 tarefas)                                  │   │
│  │  [Cancelar] [Transferir]                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                      Usuário Interage                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │  Clica no Checkbox  │
                    └─────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │   KTaskCard emite   │
                    │   @select event     │
                    └─────────────────────┘
                              ↓
        ┌─────────────────────────────────────────────┐
        │  KTasksKanbanViewContainer recebe evento    │
        │  toggleTaskSelection(taskId)                │
        └─────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────────┐
        │  useTaskSelection.toggleTaskSelection()     │
        │  Adiciona/Remove do Set<string>             │
        └─────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────────┐
        │  KBulkActionsBar renderiza com count > 0   │
        │  Aparece com animação slide-up              │
        └─────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │ Usuário clica em    │
                    │ "Transferir"        │
                    └─────────────────────┘
                              ↓
        ┌─────────────────────────────────────────────┐
        │  openBulkTransferModal()                    │
        │  isBulkTransferModalOpen = true             │
        └─────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────────┐
        │  KBulkTransferModal renderiza               │
        │  Mostra lista de colunas                    │
        └─────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │ Usuário seleciona   │
                    │ coluna de destino   │
                    └─────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │ Clica "Transferir"  │
                    │ no modal            │
                    └─────────────────────┘
                              ↓
        ┌─────────────────────────────────────────────┐
        │  @transfer event emitido                    │
        │  (columnId, taskIds)                        │
        └─────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────────┐
        │  handleBulkTransfer() executado             │
        │  Para cada task:                            │
        │  - startExiting()                           │
        │  - executeFullTransition()                  │
        │  - startEntering()                          │
        └─────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────────┐
        │  deselectAll()                              │
        │  closeBulkTransferModal()                   │
        │  KBulkActionsBar desaparece                 │
        └─────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │  ✅ Tarefas movidas  │
                    │  com animação        │
                    └─────────────────────┘
```

## Estrutura de Composables

```
┌─────────────────────────────────────────────────────────────────┐
│                    useTaskSelection()                            │
│                                                                   │
│  selectedTaskIds: Set<string>                                   │
│  ├─ toggleTaskSelection(id)                                     │
│  ├─ isTaskSelected(id): boolean                                 │
│  ├─ getSelectedTaskIds(): string[]                              │
│  ├─ selectAll(ids)                                              │
│  └─ deselectAll()                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                              │ Usa
                              │
┌─────────────────────────────────────────────────────────────────┐
│              KTasksKanbanViewContainer                           │
│                                                                   │
│  const { toggleTaskSelection, isTaskSelected, ... }             │
│        = useTaskSelection()                                      │
│                                                                   │
│  const { isBulkTransferModalOpen, ... }                         │
│        = useBulkTaskTransfer()                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                              │ Usa
                              │
┌─────────────────────────────────────────────────────────────────┐
│                  useBulkTaskTransfer()                           │
│                                                                   │
│  isBulkTransferModalOpen: Ref<boolean>                          │
│  ├─ openBulkTransferModal()                                     │
│  └─ closeBulkTransferModal()                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxo de Componentes

```
KTaskCard
  ├─ Checkbox (seleção)
  ├─ @select event
  └─ Anel verde (visual)
       ↓
KTasksKanbanViewContainer
  ├─ toggleTaskSelection()
  ├─ getSelectedTaskIds()
  ├─ handleBulkTransfer()
  ├─ handleBulkDelete()
  └─ Renderiza:
       ├─ KBulkActionsBar
       │   ├─ @transfer
       │   ├─ @delete
       │   └─ @clear
       └─ KBulkTransferModal
           ├─ @close
           └─ @transfer
```

## Ciclo de Vida da Seleção

```
┌──────────────────────────────────────────────────────────────┐
│                    ESTADO INICIAL                             │
│  selectedTaskIds = Set()                                     │
│  KBulkActionsBar: hidden                                     │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                  USUÁRIO SELECIONA                            │
│  selectedTaskIds = Set(['task1'])                            │
│  KBulkActionsBar: visible (slide-up)                         │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│              USUÁRIO SELECIONA MAIS                           │
│  selectedTaskIds = Set(['task1', 'task2', 'task3'])          │
│  KBulkActionsBar: visible (atualiza count)                   │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│            USUÁRIO CLICA "TRANSFERIR"                         │
│  isBulkTransferModalOpen = true                              │
│  KBulkTransferModal: visible (fade-in)                       │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│         USUÁRIO CONFIRMA TRANSFERÊNCIA                        │
│  handleBulkTransfer() executa                                │
│  Tarefas movidas com animação                                │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                  LIMPEZA AUTOMÁTICA                           │
│  selectedTaskIds = Set()                                     │
│  isBulkTransferModalOpen = false                             │
│  KBulkActionsBar: hidden (slide-down)                        │
│  KBulkTransferModal: hidden (fade-out)                       │
└──────────────────────────────────────────────────────────────┘
```

## Integração com Sistema Existente

```
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase (Database)                           │
│  - tasks table                                                  │
│  - kanban_columns table                                         │
│  - RLS policies                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                              │ Sincroniza
                              │
┌─────────────────────────────────────────────────────────────────┐
│              useAdvancedTransitions()                            │
│  - executeFullTransition()                                      │
│  - Atualiza column_id no banco                                  │
│  - Mantém animações suaves                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                              │ Usa
                              │
┌─────────────────────────────────────────────────────────────────┐
│          handleBulkTransfer() em Container                       │
│  - Loop através de taskIds                                      │
│  - Chama executeFullTransition() para cada                      │
│  - Sincroniza com Supabase                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Animações

```
Card Selecionado:
  ┌─────────────────────────────────────────┐
  │ Antes: Sem anel                         │
  │ Depois: Anel verde + pulse animation    │
  │ Duração: 300ms                          │
  └─────────────────────────────────────────┘

Barra de Ações:
  ┌─────────────────────────────────────────┐
  │ Entrada: slide-up + fade-in             │
  │ Saída: slide-down + fade-out            │
  │ Duração: 300ms                          │
  └─────────────────────────────────────────┘

Modal de Transferência:
  ┌─────────────────────────────────────────┐
  │ Entrada: fade-in + zoom-in              │
  │ Saída: fade-out + zoom-out              │
  │ Duração: 200ms                          │
  └─────────────────────────────────────────┘

Transferência de Card:
  ┌─────────────────────────────────────────┐
  │ 1. Exit: fade-out + scale-down (150ms)  │
  │ 2. Transition: move to new column       │
  │ 3. Enter: fade-in + scale-up (300ms)    │
  │ 4. Settle: final position (300ms)       │
  │ Total: ~750ms                           │
  └─────────────────────────────────────────┘
```

---

**Arquitetura bem estruturada, escalável e integrada com o sistema existente!** 🚀
