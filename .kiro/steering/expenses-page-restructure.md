---
inclusion: manual
---

# Reestruturação Completa: Página de Despesas

## 🎯 Objetivo Final

Transformar a página de despesas de um sistema confuso (despesas + pagamentos misturados) para um sistema claro e automatizado onde:
- **RECORRENTES** = Cadastro de despesas recorrentes
- **ÚNICOS** = Cadastro de despesas únicas
- **TODOS** = Visualização de ocorrências (próximas a vencer)
- **HISTÓRICO DE PAGAMENTOS** = Registros de pagamentos realizados
- **MÉTRICAS** = Análise de pagamentos realizados
- **Automação** = Recorrências geram ocorrências automaticamente

---

## 📊 Estado Atual do Banco de Dados

### Tabelas Existentes

#### `transactions` (Despesas)
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  category_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid'
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT, -- 'daily', 'weekly', 'monthly', etc
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  due_date TIMESTAMP,
  notes TEXT
);
```

**Problemas:**
- Não diferencia entre "despesa" e "ocorrência"
- Quando marca recorrente como "paid", não cria próxima ocorrência
- Sem controle de período/mês da ocorrência
- Sem registro de quando foi realmente pago

#### `payment_history` (Histórico de Pagamentos)
```sql
CREATE TABLE payment_history (
  id UUID PRIMARY KEY,
  expense_id UUID NOT NULL REFERENCES transactions(id),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  paid_date TIMESTAMP NOT NULL DEFAULT NOW(),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Problemas:**
- Não está sendo usado corretamente
- Deveria armazenar registros de pagamentos realizados
- Falta informação de qual ocorrência foi paga

#### `categories` (Categorias)
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Status:** ✅ OK

---

## 🗄️ Nova Estrutura de Banco de Dados

### Tabela 1: `expenses` (Despesas - Cadastro)
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  amount NUMERIC NOT NULL,
  
  -- Tipo de despesa
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT, -- 'daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'yearly'
  
  -- Período de validade
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = sem fim
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadados
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create expenses"
  ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE USING (auth.uid() = user_id);
```

### Tabela 2: `expense_occurrences` (Ocorrências - Instâncias)
```sql
CREATE TABLE expense_occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Período da ocorrência
  occurrence_date DATE NOT NULL, -- Mês/período (ex: 2024-02-01)
  due_date DATE NOT NULL, -- Data de vencimento
  
  -- Valor (pode diferir da despesa original)
  amount NUMERIC NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
  
  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE expense_occurrences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own occurrences"
  ON expense_occurrences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create occurrences"
  ON expense_occurrences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own occurrences"
  ON expense_occurrences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own occurrences"
  ON expense_occurrences FOR DELETE USING (auth.uid() = user_id);
```

### Tabela 3: `payment_records` (Registros de Pagamentos)
```sql
CREATE TABLE payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_occurrence_id UUID NOT NULL REFERENCES expense_occurrences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informações do pagamento
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT, -- 'debit', 'credit', 'transfer', 'cash', 'check', etc
  
  -- Metadados
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payment records"
  ON payment_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payment records"
  ON payment_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payment records"
  ON payment_records FOR DELETE USING (auth.uid() = user_id);
```

---

## 📋 Plano de Implementação Completo

### **FASE 1: Preparação do Banco de Dados** (1-2 dias)

#### 1.1 Criar Novas Tabelas
- [ ] Criar tabela `expenses`
- [ ] Criar tabela `expense_occurrences`
- [ ] Criar tabela `payment_records`
- [ ] Criar RLS policies para todas as tabelas
- [ ] Criar índices para performance

#### 1.2 Migração de Dados
- [ ] Copiar dados de `transactions` para `expenses`
- [ ] Gerar ocorrências para despesas existentes
- [ ] Migrar dados de `payment_history` para `payment_records`
- [ ] Validar integridade dos dados

#### 1.3 Limpeza
- [ ] Backup de `transactions` e `payment_history`
- [ ] Decidir: Manter tabelas antigas ou deletar?
- [ ] Atualizar documentação do banco

**Checklist:**
- [ ] Todas as tabelas criadas
- [ ] RLS policies aplicadas
- [ ] Dados migrados com sucesso
- [ ] Testes de integridade passando

---

### **FASE 2: Lógica de Recorrência** (2-3 dias)

#### 2.1 Funções de Banco de Dados
- [ ] Criar função `generate_expense_occurrences()` - Gera ocorrências para despesa recorrente
- [ ] Criar função `mark_occurrence_as_paid()` - Marca ocorrência como paga e cria registro
- [ ] Criar função `update_occurrence_status()` - Atualiza status (pending/overdue)
- [ ] Criar função `create_next_recurrence()` - Cria próxima ocorrência automaticamente

#### 2.2 Triggers
- [ ] Trigger ao inserir despesa recorrente: Gera ocorrências para próximos 12 meses
- [ ] Trigger ao marcar como pago: Cria registro de pagamento
- [ ] Trigger diário: Atualiza status de vencidas

#### 2.3 Composables
- [ ] `useExpenses.ts` - Refatorar para trabalhar com nova estrutura
- [ ] `useExpenseOccurrences.ts` - Novo composable para ocorrências
- [ ] `usePaymentRecords.ts` - Novo composable para registros de pagamentos

**Checklist:**
- [ ] Todas as funções criadas e testadas
- [ ] Triggers funcionando corretamente
- [ ] Composables refatorados
- [ ] Testes de lógica passando

---

### **FASE 3: Interface - Abas de Cadastro** (2-3 dias)

#### 3.1 Aba RECORRENTES (Cadastro)
- [ ] Reformular para mostrar DESPESAS RECORRENTES (não ocorrências)
- [ ] Colunas: Descrição, Categoria, Valor, Frequência, Data Início, Status
- [ ] Ações: Criar, Editar, Deletar, Pausar/Reativar
- [ ] Modal de criação/edição com campos específicos
- [ ] Ao criar: Gera ocorrências automaticamente

#### 3.2 Aba ÚNICOS (Cadastro)
- [ ] Reformular para mostrar DESPESAS ÚNICAS (não ocorrências)
- [ ] Colunas: Descrição, Categoria, Valor, Data, Status
- [ ] Ações: Criar, Editar, Deletar
- [ ] Modal de criação/edição
- [ ] Ao criar: Gera 1 ocorrência

#### 3.3 Componentes Compartilhados
- [ ] Modal de criação/edição de despesa
- [ ] Validações de formulário
- [ ] Feedback visual (sucesso/erro)

**Checklist:**
- [ ] Aba RECORRENTES funcionando
- [ ] Aba ÚNICOS funcionando
- [ ] Criação de despesas gerando ocorrências
- [ ] Edição/deleção funcionando
- [ ] Testes de UX passando

---

### **FASE 4: Interface - Abas de Apresentação** (2-3 dias)

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

**Checklist:**
- [ ] Aba TODOS mostrando ocorrências corretamente
- [ ] Aba HISTÓRICO mostrando registros de pagamentos
- [ ] Aba MÉTRICAS com dados corretos
- [ ] Filtros funcionando em todas as abas
- [ ] Testes de apresentação passando

---

### **FASE 5: Testes e Refinamento** (1-2 dias)

#### 5.1 Testes Funcionais
- [ ] Criar despesa recorrente → Gera ocorrências
- [ ] Marcar ocorrência como pago → Cria registro
- [ ] Editar despesa recorrente → Aplica a futuras
- [ ] Deletar despesa → Deleta ocorrências e registros
- [ ] Filtros funcionam em todas as abas
- [ ] Métricas calculadas corretamente

#### 5.2 Testes de Performance
- [ ] Queries otimizadas
- [ ] Índices funcionando
- [ ] Sem N+1 queries
- [ ] Carregamento rápido

#### 5.3 Testes de UX
- [ ] Fluxo intuitivo
- [ ] Mensagens de erro claras
- [ ] Feedback visual adequado
- [ ] Responsividade OK

#### 5.4 Refinamento
- [ ] Ajustes baseado em feedback
- [ ] Otimizações finais
- [ ] Documentação atualizada

**Checklist:**
- [ ] Todos os testes funcionais passando
- [ ] Performance OK
- [ ] UX validada
- [ ] Documentação completa

---

## 🔄 Fluxos de Funcionamento

### Fluxo 1: Criar Despesa Recorrente
```
1. Usuário clica "Nova Despesa" → Aba RECORRENTES
2. Preenche: Servidor, R$ 330, Mensal, Início: 01/01/2024
3. Clica "Criar"
4. Sistema:
   - Cria registro em `expenses`
   - Chama `generate_expense_occurrences()`
   - Cria 12 ocorrências em `expense_occurrences`
5. Usuário vê em TODOS: Servidor - Jan/2024, Servidor - Fev/2024, etc
```

### Fluxo 2: Marcar Ocorrência como Pago
```
1. Usuário vê em TODOS: Servidor - Fevereiro/2024 - Pendente
2. Clica "Marcar como Pago"
3. Sistema:
   - Atualiza status em `expense_occurrences` para "paid"
   - Cria registro em `payment_records` com data/método
4. Usuário vê em HISTÓRICO: Servidor - Fev/2024 - Pago em 05/02/2024
5. Métricas atualizadas automaticamente
```

### Fluxo 3: Editar Despesa Recorrente
```
1. Usuário clica em Servidor (RECORRENTES)
2. Edita: Valor de R$ 330 para R$ 350
3. Clica "Atualizar"
4. Sistema:
   - Atualiza `expenses`
   - Pergunta: "Aplicar a futuras ocorrências?"
   - Se sim: Atualiza ocorrências futuras não pagas
5. Ocorrências futuras com novo valor
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | ANTES | DEPOIS |
|---------|-------|--------|
| **TODOS** | Despesas (confuso) | Ocorrências por vencimento |
| **RECORRENTES** | Despesas recorrentes | Despesas recorrentes (cadastro) |
| **ÚNICOS** | Despesas únicas | Despesas únicas (cadastro) |
| **HISTÓRICO** | Despesas com status "paid" | Registros de pagamentos |
| **Recorrência** | Manual | Automática |
| **Dados** | Confundidos | Separados |
| **Métricas** | Baseado em despesas | Baseado em pagamentos |

---

## ✅ Checklist Geral

### Banco de Dados
- [ ] Tabela `expenses` criada
- [ ] Tabela `expense_occurrences` criada
- [ ] Tabela `payment_records` criada
- [ ] RLS policies aplicadas
- [ ] Índices criados
- [ ] Dados migrados
- [ ] Backup realizado

### Lógica
- [ ] Função `generate_expense_occurrences()` criada
- [ ] Função `mark_occurrence_as_paid()` criada
- [ ] Função `update_occurrence_status()` criada
- [ ] Triggers criados
- [ ] Composables refatorados

### Interface
- [ ] Aba RECORRENTES reformulada
- [ ] Aba ÚNICOS reformulada
- [ ] Aba TODOS reformulada
- [ ] Aba HISTÓRICO reformulada
- [ ] Aba MÉTRICAS reformulada
- [ ] Filtros funcionando
- [ ] Modais funcionando

### Testes
- [ ] Testes funcionais passando
- [ ] Testes de performance OK
- [ ] Testes de UX validados
- [ ] Documentação atualizada

---

## 🚀 Próximos Passos

1. **Você aprova essa estrutura?**
2. **Quer começar pela Fase 1 (Banco de Dados)?**
3. **Alguma mudança que gostaria de fazer?**

---

**Status**: Plano Completo ✅
**Complexidade**: Alta (requer refatoração completa)
**Tempo Estimado**: 1-2 semanas
**Prioridade**: Alta (melhora significativa na UX)
