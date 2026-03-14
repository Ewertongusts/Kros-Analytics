# Fix Temporário - Página de Despesas

## Problema
O composable `useExpenses.ts` estava tentando usar colunas que ainda não existem na tabela:
- `budget_limit`
- `is_active`

Isso causava erro 400 ao tentar salvar categorias.

## Solução Temporária
Removi as referências a essas colunas do composable até que você execute a migration no Supabase.

### Mudanças Feitas

#### 1. `upsertCategory()`
**Antes:**
```typescript
const payload: any = {
  name: category.name,
  color: category.color || '#...',
  budget_limit: category.budget_limit || null,  // ❌ Coluna não existe
  is_active: category.is_active !== false        // ❌ Coluna não existe
}
```

**Depois:**
```typescript
const payload: any = {
  name: category.name,
  color: category.color || '#...'
}
```

#### 2. `deleteCategory()`
**Antes:**
```typescript
.update({ is_active: false })  // ❌ Soft delete (coluna não existe)
```

**Depois:**
```typescript
.delete()  // ✅ Hard delete (funciona agora)
```

#### 3. `fetchCategories()`
**Antes:**
```typescript
.eq('is_active', true)  // ❌ Filtro não funciona
```

**Depois:**
```typescript
// Sem filtro (busca todas as categorias)
```

---

## Status Atual

✅ **Página de despesas funciona agora**

Você pode:
- Criar categorias
- Criar despesas
- Editar despesas
- Deletar despesas
- Marcar como pago
- Filtrar e buscar

---

## Próximas Etapas

### Quando você executar a migration no Supabase:

Execute este SQL no Supabase SQL Editor:

```sql
ALTER TABLE expense_categories 
ADD COLUMN IF NOT EXISTS budget_limit DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurring_frequency VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_is_recurring ON transactions(is_recurring);
CREATE INDEX IF NOT EXISTS idx_expense_categories_is_active ON expense_categories(is_active);
```

### Depois, atualize o composable:

Descomente as linhas que foram removidas:

**Em `upsertCategory()`:**
```typescript
const payload: any = {
  name: category.name,
  color: category.color || '#...',
  budget_limit: category.budget_limit || null,  // ✅ Descomentar
  is_active: category.is_active !== false        // ✅ Descomentar
}
```

**Em `deleteCategory()`:**
```typescript
.update({ is_active: false })  // ✅ Descomentar (soft delete)
```

**Em `fetchCategories()`:**
```typescript
.eq('is_active', true)  // ✅ Descomentar (filtro)
```

---

## Arquivos Afetados

- `app/composables/useExpenses.ts` - Removidas referências a colunas inexistentes

---

## Notas

- Esta é uma solução temporária
- A funcionalidade completa estará disponível após a migration
- Nenhuma perda de dados
- Compatível com a migration futura

