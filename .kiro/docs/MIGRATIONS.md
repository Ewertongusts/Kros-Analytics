# 🔄 Database Migrations

## Histórico de Migrações

### 1. create_tasks_table.sql
Criou a tabela principal de tarefas com suporte a:
- Título, descrição, status, prioridade
- Relacionamento com colunas
- Timestamps

### 2. create_kanban_columns_table.sql
Criou tabela de colunas do kanban com:
- Nome, status, cor
- Posição para ordenação
- Timestamps

### 3. add_position_to_tasks.sql
Adicionou campo `position` para suportar:
- Reordenação dentro de colunas
- Drag-drop com posicionamento exato

### 4. add_subtasks_support.sql
Adicionou suporte a subtarefas (opcional)

### 5. add_time_estimation.sql
Adicionou campos de estimativa de tempo

### 6. create_user_preferences.sql
Criou tabela de preferências do usuário

### 7. allow_custom_task_status.sql
Permitiu status customizados além de todo/in_progress/done

### 8. add_tasks_rls_policies.sql
Adicionou políticas de segurança (RLS)

## Como Executar Migrações

### Opção 1: Supabase Dashboard
1. Ir para SQL Editor
2. Copiar conteúdo do arquivo .sql
3. Executar

### Opção 2: CLI
```bash
supabase migration up
```

### Opção 3: Script
```bash
node scripts/execute-migration.js
```

## Verificar Migrações

```sql
-- Ver todas as tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Ver estrutura de uma tabela
\d tasks

-- Ver índices
SELECT * FROM pg_indexes WHERE tablename = 'tasks';
```

## Rollback

Se precisar reverter:
```sql
-- Remover coluna
ALTER TABLE tasks DROP COLUMN position;

-- Remover tabela
DROP TABLE tasks;
```

## Próximas Migrações Planejadas

- [ ] Adicionar soft delete (deleted_at)
- [ ] Adicionar audit log
- [ ] Adicionar full-text search
- [ ] Adicionar cache de contagem

---

**Última atualização:** 2026-03-16
