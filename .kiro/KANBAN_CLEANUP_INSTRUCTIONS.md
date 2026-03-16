# Kanban Cleanup - Instruções Urgentes

## 🚨 Problema Identificado

Seu banco de dados tem **MÚLTIPLAS colunas órfãs** com tarefas espalhadas:

```
Colunas no banco:
- 50bfe5ec-dc02-42f8-945f-76e71f873ad8 (órfã)
- custom_1773560839141 (órfã)
- f9480459-b58a-46c4-bb1a-017d7e983cde (órfã)
- orphan (órfã)
- todo (órfã)
- column-1773572055738 (órfã)
- custom_1773564890940 (órfã)
- custom_1773627491179 ✅ (ATIVA - "adsd")
- custom_1773627493809 ✅ (ATIVA - "dadsadsa")

Colunas carregadas na UI:
- custom_1773627491179 (adsd)
- custom_1773627493809 (dadsadsa)
```

**Resultado:** 14 tarefas estão em colunas que não existem na UI!

## ✅ Solução

### Passo 1: Executar SQL de Limpeza

Abra o Supabase SQL Editor e execute:

```sql
-- 1. Deletar colunas órfãs
DELETE FROM kanban_columns 
WHERE column_id NOT IN ('custom_1773627491179', 'custom_1773627493809')
AND column_id IS NOT NULL;

-- 2. Consolidar tarefas órfãs para a coluna padrão
UPDATE tasks
SET column_id = 'custom_1773627491179'
WHERE column_id NOT IN ('custom_1773627491179', 'custom_1773627493809')
OR column_id IS NULL;
```

### Passo 2: Recarregar a Página

Após executar o SQL:
1. Abra DevTools (F12)
2. Limpe o localStorage: `localStorage.clear()`
3. Recarregue a página (F5)

### Passo 3: Verificar Resultado

Você deve ver:
- ✅ 1 tarefa na coluna "adsd" (adasd)
- ✅ 14 tarefas na coluna "dadsadsa" (consolidadas)
- ✅ Nenhuma tarefa órfã

## 📊 Antes vs Depois

### ANTES (Agora)
```
Coluna "adsd" (custom_1773627491179): 1 tarefa
Coluna "dadsadsa" (custom_1773627493809): 0 tarefas
Tarefas órfãs: 14
```

### DEPOIS (Esperado)
```
Coluna "adsd" (custom_1773627491179): 15 tarefas
Coluna "dadsadsa" (custom_1773627493809): 0 tarefas
Tarefas órfãs: 0
```

## 🔧 Por que isso aconteceu?

1. Você criou várias colunas ao longo do tempo
2. Cada coluna tinha um `column_id` único
3. Depois deletou as colunas da UI
4. Mas as tarefas continuaram com os `column_id` antigos
5. Resultado: tarefas órfãs que não aparecem em nenhuma coluna

## 🛡️ Como Prevenir

1. **Adicionar constraint no banco:**
   ```sql
   ALTER TABLE tasks
   ADD CONSTRAINT fk_tasks_column_id
   FOREIGN KEY (column_id) REFERENCES kanban_columns(column_id)
   ON DELETE CASCADE;
   ```

2. **Adicionar validação no código:**
   - Verificar se `column_id` existe antes de renderizar
   - Mostrar seção de "Tarefas Órfãs" (já implementado)

3. **Adicionar migração automática:**
   - Já implementada em `useKanbanColumns.ts`
   - Função `migrateOrphanTasks()` roda automaticamente

## 📝 Checklist

- [ ] Executar SQL de limpeza no Supabase
- [ ] Limpar localStorage
- [ ] Recarregar página
- [ ] Verificar que tarefas aparecem no kanban
- [ ] Verificar que não há tarefas órfãs
- [ ] Testar criar nova tarefa
- [ ] Testar mover tarefa entre colunas

## 🚀 Próximos Passos

Após a limpeza:
1. Todas as tarefas aparecerão no kanban
2. Drag-drop funcionará corretamente
3. Novas tarefas receberão `column_id` automaticamente
4. Tarefas órfãs serão migradas automaticamente

## 💡 Dica

Se quiser manter algumas tarefas em uma coluna específica, você pode:

```sql
-- Mover tarefas específicas para a coluna "dadsadsa"
UPDATE tasks
SET column_id = 'custom_1773627493809'
WHERE id IN ('37306dc5-e357-46d9-8f27-0761c0648b84', '54eb8da5-c77c-4a16-af49-5bdac0a96e2f')
```

Mas por enquanto, recomendo consolidar tudo em uma coluna para simplificar.
