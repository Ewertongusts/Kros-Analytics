# Kanban Card Reordering - Status Atual

## ✅ Implementado

### 1. Indicadores de Drag-Over
- ✅ Indicador acima do card (h-0.5, mb-1)
- ✅ Indicador abaixo do card (h-0.5, mt-1)
- ✅ Transições suaves (duration-150)
- ✅ Sombra azul com glow effect
- **Arquivo**: `app/components/tasks/KTaskCard.vue`

### 2. Detecção de Posição
- ✅ `handleDragOver` detecta se está acima ou abaixo (threshold 35%)
- ✅ Atualiza `dragOverTaskId` e `dragOverPosition`
- ✅ Sem reorganização automática durante drag (apenas no drop)
- **Arquivo**: `app/composables/useTaskDragDrop.ts`

### 3. Cálculo de Posição
- ✅ `moveTask` calcula nova posição com decimais (0.5, 1.5, etc)
- ✅ Suporta inserção "above" e "below"
- ✅ Atualiza localmente primeiro (sem bloquear UI)
- ✅ Sincroniza com banco em background
- **Arquivo**: `app/composables/useTaskHandlers.ts`

### 4. Migration SQL
- ✅ Criada: `supabase/migrations/20260323_add_position_to_tasks.sql`
- ✅ Renomeada com timestamp para ser reconhecida pelo CLI
- ⚠️ **PENDENTE**: Executar no banco (ver próxima seção)

---

## ⚠️ Pendente

### 1. Executar Migration no Banco
**Status**: Bloqueado por issue com Supabase CLI

**Problema**: 
- Supabase CLI não reconhece migrations sem timestamp
- Migrations antigas não têm timestamp e causam conflito
- `supabase db push` falha com erro de migration history

**Solução Necessária**:
Executar manualmente no Supabase Dashboard:

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

**Passos**:
1. Ir para https://app.supabase.com/project/bbxphigcyipwqzqyehhg/sql/new
2. Copiar e colar o SQL acima
3. Executar
4. Verificar que as colunas foram criadas

---

## 🧪 Testes Necessários

Após executar a migration:

1. **Reordenação dentro da mesma coluna**
   - Arrastar card para cima/baixo
   - Soltar
   - Verificar que posição foi salva
   - Recarregar página - card deve estar na mesma posição

2. **Movimento entre colunas**
   - Arrastar card para coluna diferente
   - Soltar em posição específica
   - Verificar que `column_id` e `position` foram atualizados
   - Recarregar página - card deve estar na nova coluna

3. **Indicadores visuais**
   - Arrastar card sobre outro
   - Verificar que linha azul aparece acima/abaixo
   - Verificar que não pisca
   - Verificar que desaparece ao soltar

4. **Performance**
   - Arrastar múltiplos cards
   - Verificar que não há lag
   - Verificar que página não recarrega

---

## 📝 Arquivos Modificados

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `app/components/tasks/KTaskCard.vue` | Adicionado indicador abaixo | ✅ |
| `app/composables/useTaskDragDrop.ts` | Detecta posição acima/abaixo | ✅ |
| `app/composables/useTaskHandlers.ts` | Calcula posição com decimais | ✅ |
| `supabase/migrations/20260323_add_position_to_tasks.sql` | Criada e renomeada | ⚠️ Pendente execução |

---

## 🚀 Próximos Passos

1. **Executar migration no Supabase Dashboard** (5 min)
2. **Testar reordenação** (15 min)
3. **Fazer commit** (2 min)
4. **Verificar se há issues** (5 min)

---

## 💡 Notas Técnicas

### Cálculo de Posição
```typescript
// Exemplo: Inserir entre cards com posição 1 e 2
if (position === 'above') {
  newPosition = 2 - 0.5 = 1.5  // Entre 1 e 2
} else {
  newPosition = 2 + 0.5 = 2.5  // Após 2
}
```

### Indicadores
- Altura: `h-0.5` (2px) - não interfere com cards
- Margem: `mb-1` (4px) acima, `mt-1` (4px) abaixo
- Cor: `bg-blue-500` com `shadow-lg shadow-blue-500/50`
- Transição: `duration-150` para suavidade

### Sem Reorganização Automática
- `handleDragOver` NÃO chama `moveTask` durante drag
- Apenas atualiza `dragOverTaskId` e `dragOverPosition`
- `moveTask` é chamado apenas em `handleDrop`
- Evita flickering e reorganização indesejada

---

## 📞 Referências

- **Steering**: kanban2-implementation.md
- **Improvements**: kanban-improvements.md
- **Previous Fix**: DRAG_DROP_RELOAD_FINAL_FIX.md
