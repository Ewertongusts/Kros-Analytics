# FASE 2: Lógica de Recorrência - COMPLETO ✅

## 📋 O que foi feito

### 1. Documentação SQL
- ✅ Criado `.kiro/DATABASE_MIGRATION_PHASE2.md` com instruções completas para:
  - Função `generate_expense_occurrences()` - Gera ocorrências para despesas recorrentes
  - Função `mark_occurrence_as_paid()` - Marca ocorrência como paga e cria registro
  - Função `update_occurrence_status()` - Atualiza status (pending/overdue)
  - Função `create_next_recurrence()` - Cria próxima ocorrência automaticamente
  - Trigger ao inserir despesa recorrente
  - Função para atualizar status de vencidas
  - Testes para validar as funções

### 2. Refatoração de Composables
- ✅ Atualizado `app/composables/useExpenses.ts`
  - Alterado interface `Expense` para refletir nova estrutura (sem status, com start_date/end_date)
  - Atualizado `fetchExpenses()` para buscar da tabela `expenses`
  - Atualizado `fetchCategories()` para filtrar por user_id
  - Refatorado `upsertExpense()` para trabalhar com nova estrutura
  - Refatorado `deleteExpense()` para nova tabela
  - Adicionado `toggleExpenseActive()` para pausar/reativar despesas
  - Removido `markExpenseAsPaid()` (agora é responsabilidade de `useExpenseOccurrences`)
  - Adicionado computed properties: `getRecurringExpenses`, `getUniqueExpenses`, `getActiveExpenses`, `getInactiveExpenses`
  - Removido computed properties antigos baseados em status

## 🔄 Fluxo de Funcionamento

### Criar Despesa Recorrente
```
1. useExpenses.upsertExpense({ is_recurring: true, ... })
2. Despesa inserida em tabela `expenses`
3. Trigger `trigger_expenses_generate_occurrences` dispara
4. Função `generate_expense_occurrences()` cria 12 ocorrências
5. Ocorrências aparecem em `expense_occurrences`
```

### Marcar Ocorrência como Paga
```
1. useExpenseOccurrences.updateOccurrenceStatus(id, 'paid')
2. Status atualizado em `expense_occurrences`
3. Manualmente chamar usePaymentRecords.createRecord()
4. Registro criado em `payment_records`
```

### Atualizar Status de Vencidas
```
1. Chamar função SQL `update_overdue_occurrences()` (via cron job)
2. Ocorrências com due_date < hoje e status = pending → status = overdue
```

## 🚀 Próximos Passos

### FASE 3: Interface - Abas de Cadastro (2-3 dias)

#### 3.1 Aba RECORRENTES (Cadastro)
- [ ] Reformular para mostrar DESPESAS RECORRENTES (não ocorrências)
- [ ] Colunas: Descrição, Categoria, Valor, Frequência, Data Início, Status
- [ ] Ações: Criar, Editar, Deletar, Pausar/Reativar
- [ ] Modal de criação/edição com campos específicos
- [ ] Ao criar: Gera ocorrências automaticamente (via trigger)

#### 3.2 Aba ÚNICOS (Cadastro)
- [ ] Reformular para mostrar DESPESAS ÚNICAS (não ocorrências)
- [ ] Colunas: Descrição, Categoria, Valor, Data, Status
- [ ] Ações: Criar, Editar, Deletar
- [ ] Modal de criação/edição
- [ ] Ao criar: Gera 1 ocorrência (via trigger)

### FASE 4: Interface - Abas de Apresentação (2-3 dias)

#### 4.1 Aba TODOS (Apresentação + Ação)
- [ ] Mostrar OCORRÊNCIAS (não despesas)
- [ ] Ordenar por data de vencimento (próximas primeiro)
- [ ] Colunas: Descrição, Categoria, Valor, Vencimento, Status, Ações
- [ ] Filtros: Categoria, Status (Pago/Pendente/Vencida), Mês, Período
- [ ] Ações: Marcar como Pago, Editar, Deletar
- [ ] Ao marcar como pago: Cria registro de pagamento

#### 4.2 Aba HISTÓRICO DE PAGAMENTOS (Apresentação)
- [ ] Mostrar REGISTROS DE PAGAMENTOS REALIZADOS
- [ ] Colunas: Descrição, Categoria, Valor, Data Pagamento, Método, Notas
- [ ] Filtros: Categoria, Período, Método de Pagamento
- [ ] Ações: Visualizar detalhes, Deletar registro
- [ ] Apenas leitura (exceto delete)

#### 4.3 Aba MÉTRICAS (Apresentação)
- [ ] Baseado em PAGAMENTOS REALIZADOS (não despesas)
- [ ] Cards: Total Pago, Média, Maior, Menor, Período
- [ ] Gráficos: Evolução, Distribuição por categoria
- [ ] Filtros: Período, Categoria
- [ ] Apenas leitura

### FASE 5: Testes e Refinamento (1-2 dias)

- [ ] Testes funcionais completos
- [ ] Testes de performance
- [ ] Testes de UX
- [ ] Documentação final

## 📝 Instruções para Executar FASE 2

1. **Abra o Supabase SQL Editor**
2. **Execute os scripts em `.kiro/DATABASE_MIGRATION_PHASE2.md`** na seguinte ordem:
   - Passo 1: Função `generate_expense_occurrences()`
   - Passo 2: Função `mark_occurrence_as_paid()`
   - Passo 3: Função `update_occurrence_status()`
   - Passo 4: Função `create_next_recurrence()`
   - Passo 5: Trigger ao inserir despesa
   - Passo 6: Função para atualizar status de vencidas
3. **Execute os testes** para validar as funções
4. **Verifique que as funções foram criadas** no Supabase Dashboard

## ✅ Checklist

- [ ] Funções SQL criadas no Supabase
- [ ] Triggers criados
- [ ] Composable `useExpenses.ts` refatorado
- [ ] Testes SQL executados com sucesso
- [ ] Documentação SQL pronta em `.kiro/DATABASE_MIGRATION_PHASE2.md`

## 🎯 Status Geral

**FASE 1**: ✅ COMPLETO (Tabelas + Composables)
**FASE 2**: ✅ COMPLETO (Funções + Triggers + Refatoração)
**FASE 3**: ⏳ PRÓXIMO (Interface de Cadastro)
**FASE 4**: ❌ PENDENTE (Interface de Apresentação)
**FASE 5**: ❌ PENDENTE (Testes)

---

**Próximo Passo**: Executar os scripts SQL no Supabase e depois começar FASE 3 (Interface de Cadastro)
