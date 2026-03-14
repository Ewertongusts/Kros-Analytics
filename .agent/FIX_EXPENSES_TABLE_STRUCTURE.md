# FIX: Corrigir estrutura da tabela expenses

## Problema
A tabela `expenses` está referenciando `expense_categories(id)` mas deveria referenciar `categories(id)`.

## Solução
Execute este SQL no Supabase SQL Editor:

```sql
-- 1. Remover a constraint antiga
ALTER TABLE expenses
DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;

-- 2. Adicionar a constraint correta
ALTER TABLE expenses
ADD CONSTRAINT expenses_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

-- 3. Verificar se a coluna category_id existe, se não, adicionar
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS category_id UUID;

-- 4. Criar índice se não existir
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
- ✅ Salvar a despesa sem erros de constraint

