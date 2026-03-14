# 🚀 Production Deployment - Expenses Restructure

## ⏱️ Timeline: 30-45 minutos

---

## PASSO 1: Executar Scripts SQL (5-10 minutos)

### 1.1 Abrir Supabase SQL Editor
1. Vá para seu projeto Supabase
2. Clique em "SQL Editor"
3. Clique em "New Query"

### 1.2 Executar FASE 1 (Tabelas)
**Copie e execute TODO o conteúdo de `.kiro/DATABASE_MIGRATION_PHASE1.md`**

Passos:
1. Abra `.kiro/DATABASE_MIGRATION_PHASE1.md`
2. Copie TODO o conteúdo (Passo 1 até Passo 3)
3. Cole no Supabase SQL Editor
4. Clique "Run"
5. Verifique que não há erros

**Verificação**:
- [ ] Tabela `expenses` criada
- [ ] Tabela `expense_occurrences` criada
- [ ] Tabela `payment_records` criada
- [ ] RLS policies aplicadas
- [ ] Índices criados

### 1.3 Executar FASE 2 (Funções e Triggers)
**Copie e execute TODO o conteúdo de `.kiro/DATABASE_MIGRATION_PHASE2.md`**

Passos:
1. Abra `.kiro/DATABASE_MIGRATION_PHASE2.md`
2. Copie TODO o conteúdo (Passo 1 até Passo 6)
3. Cole no Supabase SQL Editor
4. Clique "Run"
5. Verifique que não há erros

**Verificação**:
- [ ] Função `generate_expense_occurrences()` criada
- [ ] Função `mark_occurrence_as_paid()` criada
- [ ] Função `update_occurrence_status()` criada
- [ ] Função `create_next_recurrence()` criada
- [ ] Trigger ao inserir despesa criado
- [ ] Função para atualizar vencidas criada

### 1.4 Verificar no Supabase Dashboard
1. Vá para "Table Editor"
2. Verifique que as 3 tabelas aparecem:
   - `expenses`
   - `expense_occurrences`
   - `payment_records`
3. Clique em cada tabela e verifique que têm as colunas corretas

---

## PASSO 2: Integrar Componentes (5-10 minutos)

### 2.1 Abrir `app/pages/despesas.vue`

### 2.2 Substituir o Conteúdo

**Copie este código:**

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
import KCategoriesTab from '~/components/blocks/KCategoriesTab.vue'

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

### 2.3 Salvar o Arquivo
- Salve `app/pages/despesas.vue`
- Verifique que não há erros de sintaxe

---

## PASSO 3: Testar Fluxos (10-15 minutos)

### 3.1 Abrir a Página de Despesas
1. Abra seu navegador
2. Vá para a página de despesas
3. Verifique que as abas aparecem:
   - Métricas
   - Todos
   - Recorrentes
   - Únicos
   - Histórico
   - Categorias

### 3.2 Teste 1: Criar Despesa Recorrente
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
5. ✅ Verifique que a despesa aparece na tabela

### 3.3 Teste 2: Verificar Ocorrências Criadas
1. Clique na aba "Todos"
2. ✅ Verifique que 12 ocorrências aparecem (uma para cada mês)
3. ✅ Verifique que estão ordenadas por data de vencimento

### 3.4 Teste 3: Marcar Ocorrência como Paga
1. Na aba "Todos", clique no ícone de check (marcar como pago)
2. Modal abre para registrar pagamento
3. Preencha:
   - Data: Hoje
   - Método: Débito
   - Notas: Pagamento via débito
4. Clique "Confirmar"
5. ✅ Verifique que o status muda para "Pago"

### 3.5 Teste 4: Visualizar Histórico
1. Clique na aba "Histórico"
2. ✅ Verifique que o pagamento aparece na tabela
3. ✅ Verifique que mostra: Descrição, Categoria, Valor, Data, Método

### 3.6 Teste 5: Visualizar Métricas
1. Clique na aba "Métricas"
2. ✅ Verifique que os cards mostram:
   - Total Pago: R$ 330.00
   - Média: R$ 330.00
   - Maior: R$ 330.00
   - Menor: R$ 330.00
3. ✅ Verifique que a distribuição por categoria mostra a despesa

### 3.7 Teste 6: Criar Despesa Única
1. Clique na aba "Únicos"
2. Clique em "Nova Despesa"
3. Preencha:
   - Descrição: "Compra Equipamento"
   - Categoria: Selecione uma
   - Valor: 5000.00
   - Tipo: Único
   - Data: Hoje
4. Clique "Salvar"
5. ✅ Verifique que a despesa aparece na tabela
6. Clique na aba "Todos"
7. ✅ Verifique que 1 ocorrência foi criada

### 3.8 Teste 7: Editar Despesa
1. Clique na aba "Recorrentes"
2. Clique no ícone de editar
3. Alterar valor de 330.00 para 350.00
4. Clique "Salvar"
5. ✅ Verifique que a despesa foi atualizada

### 3.9 Teste 8: Pausar Despesa
1. Clique na aba "Recorrentes"
2. Clique no ícone de pausar
3. ✅ Verifique que status muda para "Pausada"
4. ✅ Verifique que despesa desaparece da tabela

### 3.10 Teste 9: Filtros
1. Clique na aba "Todos"
2. Teste cada filtro:
   - [ ] Busca por descrição
   - [ ] Filtro por categoria
   - [ ] Filtro por status
   - [ ] Filtro por mês/ano
   - [ ] Filtro por período
3. ✅ Verifique que os filtros funcionam

---

## PASSO 4: Verificação Final (5 minutos)

### 4.1 Verificar Reatividade
- [ ] Criar despesa
- [ ] Dados aparecem em tempo real
- [ ] Editar despesa
- [ ] Mudanças aparecem em tempo real
- [ ] Deletar despesa
- [ ] Dados desaparecem em tempo real

### 4.2 Verificar Performance
- [ ] Abrir DevTools Network
- [ ] Queries são rápidas (< 1 segundo)
- [ ] Não há N+1 queries
- [ ] Não há requests desnecessários

### 4.3 Verificar Segurança
- [ ] Cada usuário vê apenas seus dados
- [ ] RLS policies funcionam
- [ ] Não há acesso a dados de outros usuários

### 4.4 Verificar Responsividade
- [ ] Página funciona em desktop
- [ ] Página funciona em tablet
- [ ] Página funciona em mobile

---

## ✅ Checklist de Produção

### SQL Execution
- [ ] FASE 1 executada com sucesso
- [ ] FASE 2 executada com sucesso
- [ ] Tabelas criadas no Supabase
- [ ] Funções criadas no Supabase
- [ ] Triggers criados no Supabase

### Integração
- [ ] `app/pages/despesas.vue` atualizado
- [ ] Componentes importados corretamente
- [ ] Página carrega sem erros
- [ ] Abas aparecem corretamente

### Testes
- [ ] Teste 1: Criar despesa recorrente ✅
- [ ] Teste 2: Verificar ocorrências ✅
- [ ] Teste 3: Marcar como paga ✅
- [ ] Teste 4: Visualizar histórico ✅
- [ ] Teste 5: Visualizar métricas ✅
- [ ] Teste 6: Criar despesa única ✅
- [ ] Teste 7: Editar despesa ✅
- [ ] Teste 8: Pausar despesa ✅
- [ ] Teste 9: Filtros ✅

### Verificação Final
- [ ] Reatividade OK
- [ ] Performance OK
- [ ] Segurança OK
- [ ] Responsividade OK

---

## 🎯 Resultado Esperado

Após completar todos os passos, você terá:

✅ **Sistema de Despesas Completo**
- Cadastro de despesas recorrentes e únicas
- Geração automática de ocorrências
- Histórico de pagamentos
- Métricas e análises
- Filtros avançados
- Automação via triggers

✅ **Banco de Dados Estruturado**
- 3 tabelas bem definidas
- RLS policies para segurança
- Índices para performance
- Funções SQL para automação

✅ **Interface Intuitiva**
- 6 abas bem organizadas
- Componentes reutilizáveis
- Filtros avançados
- Summary cards com métricas

---

## 🚀 Próximos Passos (Após Produção)

1. **Monitoramento**
   - Verificar logs de erro
   - Monitorar performance
   - Coletar feedback dos usuários

2. **Refinamento**
   - Ajustes de UX baseado em feedback
   - Otimizações de performance
   - Melhorias de acessibilidade

3. **Expansão**
   - Adicionar exportação para CSV
   - Adicionar gráficos mais avançados
   - Adicionar notificações de vencimento

---

## 📞 Suporte

Se encontrar problemas:

1. **Erro ao executar SQL**
   - Verifique que está no Supabase SQL Editor
   - Verifique que copiou TODO o conteúdo
   - Verifique que não há caracteres especiais

2. **Componentes não carregam**
   - Verifique que os imports estão corretos
   - Verifique que os componentes existem em `app/components/expenses/`
   - Abra DevTools Console e procure por erros

3. **Dados não aparecem**
   - Verifique que as tabelas foram criadas
   - Verifique que o usuário está autenticado
   - Abra DevTools Console e procure por erros

4. **Filtros não funcionam**
   - Verifique que os composables estão retornando dados
   - Abra DevTools Console e procure por erros

---

## 📊 Tempo Total

- **SQL Execution**: 5-10 minutos
- **Integração**: 5-10 minutos
- **Testes**: 10-15 minutos
- **Verificação**: 5 minutos

**Total**: 30-45 minutos

---

**Status**: 🚀 PRONTO PARA PRODUÇÃO
**Data**: 14 de Março de 2026
**Versão**: 1.0.0
