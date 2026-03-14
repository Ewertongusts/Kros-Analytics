# FIX: Adicionar coluna category_id na tabela expenses

## Problema
A tabela `expenses` não tem a coluna `category_id`, causando erro ao criar despesas.

## Solução
Execute este SQL no Supabase SQL Editor:

```sql
-- Adicionar coluna category_id à tabela expenses
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES expense_categories(id) ON DELETE CASCADE;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
```

## Passos para Executar

1. Abra o Supabase Dashboard
2. Vá para **SQL Editor**
3. Cole o SQL acima
4. Clique em **Run**
5. Volte para a aplicação e tente criar uma despesa novamente

## Verificação

Após executar, você deve conseguir:
- ✅ Criar uma nova despesa
- ✅ Selecionar uma categoria
- ✅ Salvar a despesa sem erros

