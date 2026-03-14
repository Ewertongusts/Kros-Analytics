# Status: Descrição do Produto em Comprovantes

## Situação Atual

### ✅ Implementado
- Código para capturar descrição do produto
- Renderização de descrição em comprovantes (imagem/PDF)
- Inclusão de descrição em mensagens de WhatsApp
- Componente modal atualizado para preencher descrição automaticamente

### ⚠️ Pendente
- Executar migration SQL no Supabase para adicionar coluna `description` à tabela `sales`

## Próximos Passos

### 1. Executar SQL no Supabase (URGENTE)

Abrir Supabase Dashboard → SQL Editor e executar:

```sql
ALTER TABLE sales ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN sales.description IS 'Descrição do produto/serviço do catálogo no momento da venda';
```

### 2. Após Executar a Migration

Desabilitar o código temporário em `useSaleCrud.ts`:

```typescript
// Remover os delete statements:
delete updateData.description
delete insertData.description
```

E reabilitar a lógica de buscar descrição:

```typescript
// Buscar descrição do produto do catálogo se plan_name existir
let productDescription = normalizedData.custom_description || null
if (normalizedData.plan_name && normalizedData.plan_name !== '__PERSONALIZADO__' && !productDescription) {
  const { data: planData } = await supabase
    .from('plans')
    .select('description')
    .eq('name', normalizedData.plan_name)
    .limit(1)
  
  if (planData && planData.length > 0 && planData[0].description) {
    productDescription = planData[0].description
  }
}
```

E adicionar de volta:
```typescript
description: productDescription,
```

### 3. Testar

- Criar novo serviço
- Exportar comprovante
- Enviar via WhatsApp
- Verificar se descrição aparece

## Arquivos Modificados

| Arquivo | Status | Mudança |
|---------|--------|---------|
| `useSaleCrud.ts` | ⚠️ Temporário | Removida lógica de descrição |
| `useSaleReceipt.ts` | ⚠️ Temporário | Usa apenas `custom_description` |
| `useSaleActions.ts` | ⚠️ Temporário | Usa apenas `custom_description` |
| `KSaleModal.vue` | ✅ Pronto | Preenche descrição automaticamente |
| `supabase/migrations/20260314_add_description_to_sales.sql` | ⏳ Pendente | Precisa executar |

## Motivo do Erro Atual

O código estava tentando salvar a coluna `description` que não existe na tabela `sales`. Temporariamente, removemos essa lógica para que o sistema funcione. Após executar a migration, reabilitaremos a funcionalidade completa.

## Checklist Final

- [ ] Executar SQL no Supabase
- [ ] Limpar cache do navegador
- [ ] Testar criação de serviço
- [ ] Reabilitar lógica de descrição em `useSaleCrud.ts`
- [ ] Testar comprovante com descrição
- [ ] Testar WhatsApp com descrição
