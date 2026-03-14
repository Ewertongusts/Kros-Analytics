# Fix: Erro ao Criar Serviço - "description" column not found

## Problema
Ao tentar criar um serviço, aparece o erro:
```
Could not find the "description" column of "sales" in the schema cache.
```

## Causa
A migration que adiciona a coluna `description` à tabela `sales` não foi executada no banco de dados.

## Solução

### Passo 1: Executar SQL no Supabase

1. Abrir [Supabase Dashboard](https://app.supabase.com)
2. Selecionar o projeto
3. Ir para **SQL Editor**
4. Clicar em **New Query**
5. Copiar e colar o SQL abaixo:

```sql
ALTER TABLE sales ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN sales.description IS 'Descrição do produto/serviço do catálogo no momento da venda';
```

6. Clicar em **Run** (ou Ctrl+Enter)
7. Aguardar a execução

### Passo 2: Limpar Cache do Navegador

1. Abrir DevTools (F12)
2. Ir para **Application** → **Cache Storage**
3. Deletar todos os caches
4. Recarregar a página (Ctrl+Shift+R)

### Passo 3: Testar

1. Ir para página de Vendas
2. Clicar em "NOVA VENDA"
3. Selecionar tipo "SERVIÇO"
4. Tentar criar um serviço

## Verificação

Se a coluna foi adicionada com sucesso, execute esta query para confirmar:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sales' 
ORDER BY ordinal_position;
```

Você deve ver `description` na lista com tipo `text`.

## Rollback (se necessário)

Se houver problemas, remover a coluna:

```sql
ALTER TABLE sales DROP COLUMN IF EXISTS description;
```

## Arquivos Relacionados

- `supabase/migrations/20260314_add_description_to_sales.sql` - Migration original
- `supabase/fix_sales_description.sql` - SQL para executar manualmente
- `app/composables/useSaleCrud.ts` - Código que usa a coluna (temporariamente desabilitado)

## Status

⚠️ **Pendente**: Executar SQL no Supabase
