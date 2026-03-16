# Como Executar a Migration de Reordenação

## 🎯 Objetivo
Adicionar suporte a reordenação de cards no kanban salvando a posição no banco de dados.

## ⚠️ Status Atual
- ✅ UI implementada (indicadores de drag-over)
- ✅ Lógica de reordenação implementada
- ❌ **FALTA**: Executar migration no banco

## 📋 Passo a Passo

### 1. Abrir Supabase Dashboard
Acesse: https://app.supabase.com/project/bbxphigcyipwqzqyehhg/sql/new

### 2. Copiar o SQL
```sql
-- Add position and column_id columns to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS position NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS column_id VARCHAR(255);

-- Create index for position
CREATE INDEX IF NOT EXISTS idx_tasks_column_id_position ON public.tasks(column_id, position);

-- Update existing tasks to have default position based on creation order
UPDATE public.tasks 
SET position = ROW_NUMBER() OVER (PARTITION BY column_id ORDER BY created_at ASC) - 1
WHERE position = 0 OR position IS NULL;
```

### 3. Executar
1. Cole o SQL na aba "SQL Editor"
2. Clique em "Run" (ou Ctrl+Enter)
3. Aguarde a execução

### 4. Verificar
Você deve ver:
```
Query executed successfully
```

Se houver erro, verifique:
- Está logado no Supabase?
- Está no projeto correto (bbxphigcyipwqzqyehhg)?
- As colunas já existem? (Se sim, o `IF NOT EXISTS` vai ignorar)

---

## 🧪 Testar Reordenação

Após executar a migration:

1. **Abrir página de tarefas** (http://localhost:3000/tarefas)
2. **Arrastar um card** para cima/baixo
3. **Soltar** o card
4. **Verificar**:
   - ✅ Card ficou na nova posição?
   - ✅ Linha azul apareceu durante drag?
   - ✅ Página não recarregou?
5. **Recarregar página** (F5)
6. **Verificar**: Card está na mesma posição?

Se tudo funcionar, a reordenação está pronta! 🎉

---

## 🐛 Troubleshooting

### "Column already exists"
- Significa que a migration já foi executada
- Tudo está ok, pode ignorar

### "Permission denied"
- Verifique se está logado no Supabase
- Verifique se tem permissão de admin

### Cards não salvam posição
- Verifique no console do navegador (F12)
- Procure por erros de rede
- Verifique se as colunas foram criadas

---

## 📞 Próximas Melhorias

Após confirmar que funciona:
- [ ] Adicionar virtualização de cards (performance)
- [ ] Adicionar indicador de progresso por coluna
- [ ] Adicionar atalhos de teclado
- [ ] Adicionar bulk actions

Ver: `kanban-improvements.md`
