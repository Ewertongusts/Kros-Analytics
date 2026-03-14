# Guia de Integração: Página de Despesas

## 📋 Resumo

Este guia mostra como integrar todos os componentes criados na página de despesas (`app/pages/despesas.vue`).

---

## 🚀 Passo 1: Executar Scripts SQL

Antes de integrar os componentes, você precisa executar os scripts SQL no Supabase:

### 1.1 Abra o Supabase SQL Editor
- Vá para seu projeto Supabase
- Clique em "SQL Editor"
- Crie uma nova query

### 1.2 Execute FASE 1 (Tabelas)
Copie e execute o conteúdo de `.kiro/DATABASE_MIGRATION_PHASE1.md`:
- Passo 1: Criar tabela `expenses`
- Passo 2: Criar tabela `expense_occurrences`
- Passo 3: Criar tabela `payment_records`

### 1.3 Execute FASE 2 (Funções e Triggers)
Copie e execute o conteúdo de `.kiro/DATABASE_MIGRATION_PHASE2.md`:
- Passo 1: Função `generate_expense_occurrences()`
- Passo 2: Função `mark_occurrence_as_paid()`
- Passo 3: Função `update_occurrence_status()`
- Passo 4: Função `create_next_recurrence()`
- Passo 5: Trigger ao inserir despesa
- Passo 6: Função para atualizar status de vencidas

### 1.4 Verifique que as Tabelas Foram Criadas
- Vá para "Table Editor"
- Verifique que as tabelas aparecem: `expenses`, `expense_occurrences`, `payment_records`

---

## 🔧 Passo 2: Atualizar a Página de Despesas

### 2.1 Abra `app/pages/despesas.vue`

Substitua o conteúdo atual por:

```vue
<template>
  <KPageLayout title="Despesas" subtitle="Gerencie suas despesas recorrentes e únicas">
    <!-- Tabs Navigation -->
    <div class="flex gap-2 mb-6 border-b border-white/10">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-4 py-3 font-semibold text-sm transition-colors border-b-2',
          activeTab === tab.id
            ? 'text-[var(--kros-blue)] border-[var(--kros-blue)]'
            : 'text-white/60 border-transparent hover:text-white/80'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="space-y-4">
      <KMetricsTab v-if="activeTab === 'metricas'" />
      <KAllOccurrencesTab v-if="activeTab === 'todos'" />
      <KRecurringExpensesTab v-if="activeTab === 'recorrentes'" />
      <KUniqueExpensesTab v-if="activeTab === 'unicos'" />
      <KPaymentHistoryTab v-if="activeTab === 'historico'" />
      <KCategoriesTab v-if="activeTab === 'categorias'" />
    </div>
  </KPageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import KPageLayout from '~/components/blocks/KPageLayout.vue'
import KMetricsTab from '~/components/expenses/KMetricsTab.vue'
import KAllOccurrencesTab from '~/components/expenses/KAllOccurrencesTab.vue'
import KRecurringExpensesTab from '~/components/expenses/KRecurringExpensesTab.vue'
import KUniqueExpensesTab from '~/components/expenses/KUniqueExpensesTab.vue'
import KPaymentHistoryTab from '~/components/expenses/KPaymentHistoryTab.vue'
import KCategoriesTab from '~/components/blocks/KCategoriesTab.vue' // Componente existente

const activeTab = ref('metricas')

const tabs = [
  { id: 'metricas', label: 'Métricas' },
  { id: 'todos', label: 'Todos' },
  { id: 'recorrentes', label: 'Recorrentes' },
  { id: 'unicos', label: 'Únicos' },
  { id: 'historico', label: 'Histórico' },
  { id: 'categorias', label: 'Categorias' }
]
</script>
```

---

## ✅ Passo 3: Verificar Integração

### 3.1 Teste a Página
1. Abra a página de despesas
2. Verifique que as abas aparecem
3. Clique em cada aba para verificar que os componentes carregam

### 3.2 Teste o Fluxo Completo

#### Teste 1: Criar Despesa Recorrente
1. Clique na aba "Recorrentes"
2. Clique em "Nova Despesa"
3. Preencha:
   - Descrição: "Servidor"
   - Categoria: Selecione uma
   - Valor: 330.00
   - Tipo: Recorrente
   - Frequência: Mensal
   - Data Início: 01/01/2024
4. Clique "Salvar"
5. Verifique que a despesa aparece na tabela
6. Clique na aba "Todos"
7. Verifique que 12 ocorrências aparecem (uma para cada mês)

#### Teste 2: Marcar Ocorrência como Paga
1. Na aba "Todos", clique no ícone de check (marcar como pago)
2. Modal abre para registrar pagamento
3. Preencha:
   - Data: Hoje
   - Método: Débito
   - Notas: Pagamento via débito
4. Clique "Confirmar"
5. Verifique que o status muda para "Pago"
6. Clique na aba "Histórico"
7. Verifique que o pagamento aparece na tabela

#### Teste 3: Visualizar Métricas
1. Clique na aba "Métricas"
2. Verifique que os cards mostram:
   - Total Pago: R$ 330.00
   - Média: R$ 330.00
   - Maior: R$ 330.00
   - Menor: R$ 330.00
3. Verifique que a distribuição por categoria mostra a despesa

---

## 🐛 Troubleshooting

### Problema: Componentes não carregam
**Solução**: Verifique que os imports estão corretos e que os componentes existem em `app/components/expenses/`

### Problema: Dados não aparecem
**Solução**: 
1. Verifique que os scripts SQL foram executados
2. Verifique que as tabelas existem no Supabase
3. Verifique que o usuário está autenticado
4. Abra o DevTools Console e procure por erros

### Problema: Filtros não funcionam
**Solução**: Verifique que os composables estão retornando dados corretamente

### Problema: Reatividade quebrada
**Solução**: Verifique que está usando `toRef()` quando passar props para composables

---

## 📝 Notas Importantes

1. **Reatividade**: Os composables usam `toRef()` para manter reatividade com props
2. **RLS Policies**: Cada usuário vê apenas seus próprios dados
3. **Triggers**: Ao criar despesa recorrente, ocorrências são criadas automaticamente
4. **Performance**: Índices foram criados para otimizar queries
5. **Backup**: Sempre faça backup antes de migrar dados

---

## 🚀 Próximos Passos

1. ✅ Executar scripts SQL
2. ✅ Integrar componentes na página
3. ✅ Testar fluxos completos
4. ⏳ Refinamento baseado em feedback
5. ⏳ Deploy em produção

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no DevTools Console
2. Verifique que as tabelas existem no Supabase
3. Verifique que os composables estão retornando dados
4. Verifique que o usuário está autenticado

---

**Status**: Pronto para integração
**Complexidade**: Baixa (apenas integração de componentes)
**Tempo Estimado**: 15-30 minutos
