# Instruções de Setup - Página de Despesas

## Erro Encontrado
```
Could not find the 'budget_limit' column of 'expense_categories' in the schema cache
```

## Solução

Você precisa adicionar as colunas faltantes no Supabase. Siga os passos:

### Passo 1: Abrir SQL Editor no Supabase

1. Acesse seu projeto no Supabase
2. Vá para "SQL Editor"
3. Clique em "New Query"

### Passo 2: Executar o SQL

Cole o seguinte SQL e execute:

```sql
-- Adicionar campos à tabela expense_categories
ALTER TABLE expense_categories 
ADD COLUMN IF NOT EXISTS budget_limit DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Adicionar campos à tabela transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurring_frequency VARCHAR(20);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_is_recurring ON transactions(is_recurring);
CREATE INDEX IF NOT EXISTS idx_expense_categories_is_active ON expense_categories(is_active);
```

### Passo 3: Verificar

Após executar, você deve ver:
- ✅ "Query executed successfully"

### Passo 4: Testar

Volte para a aplicação e tente acessar a página de despesas novamente.

---

## O que foi adicionado

### Tabela: expense_categories
- `budget_limit` - Limite de orçamento para a categoria (opcional)
- `is_active` - Flag para soft delete (padrão: true)

### Tabela: transactions
- `status` - Status da despesa (pending/paid)
- `notes` - Notas/observações
- `receipt_url` - URL do comprovante
- `is_recurring` - Se é despesa recorrente
- `recurring_frequency` - Frequência da recorrência (monthly, weekly, etc)

### Índices
- `idx_transactions_status` - Para filtrar por status
- `idx_transactions_is_recurring` - Para filtrar recorrentes
- `idx_expense_categories_is_active` - Para filtrar categorias ativas

---

## Próximas Etapas

Após adicionar os campos:

1. Recarregue a página de despesas
2. Teste criar uma despesa
3. Teste marcar como pago
4. Teste adicionar notas

---

## Troubleshooting

### Se receber erro "Column already exists"
- Isso é normal, significa que a coluna já foi adicionada
- O SQL usa `IF NOT EXISTS` para evitar erros

### Se a página ainda não funcionar
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Recarregue a página (Ctrl+F5)
- Verifique o console (F12) para erros

### Se receber erro de permissão
- Verifique se você está logado como admin no Supabase
- Verifique as políticas RLS da tabela

---

## Documentação Relacionada

- `.agent/EXPENSES_PAGE_IMPROVEMENTS_COMPLETE.md` - Detalhes das melhorias
- `app/composables/useExpenses.ts` - Composable de despesas
- `app/components/blocks/KExpensesManagement.vue` - Componente principal

