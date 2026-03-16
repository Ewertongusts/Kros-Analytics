# 📊 Database Schema

## Tabelas Principais

### tasks
Armazena todas as tarefas do kanban.

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  column_id UUID REFERENCES kanban_columns(column_id),
  position INTEGER DEFAULT 0,
  due_date TIMESTAMP,
  company_id UUID,
  assigned_to UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Campos Importantes:**
- `column_id` - Qual coluna a tarefa pertence
- `position` - Ordem dentro da coluna (0, 1, 2, ...)
- `status` - Estado da tarefa (todo, in_progress, done)

### kanban_columns
Define as colunas do kanban.

```sql
CREATE TABLE kanban_columns (
  column_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT,
  color TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Campos Importantes:**
- `name` - Nome da coluna (ex: "To Do", "In Progress")
- `position` - Ordem das colunas
- `status` - Status associado (para compatibilidade)

## Relacionamentos

```
kanban_columns (1) ──── (N) tasks
    column_id              column_id
```

## Índices

Para performance:
```sql
CREATE INDEX idx_tasks_column_id ON tasks(column_id);
CREATE INDEX idx_tasks_position ON tasks(position);
CREATE INDEX idx_kanban_columns_position ON kanban_columns(position);
```

## Queries Comuns

### Buscar tarefas de uma coluna
```sql
SELECT * FROM tasks 
WHERE column_id = 'xxx' 
ORDER BY position ASC;
```

### Mover tarefa entre colunas
```sql
UPDATE tasks 
SET column_id = 'new_column_id', position = 5 
WHERE id = 'task_id';
```

### Reordenar tarefas
```sql
UPDATE tasks 
SET position = position + 1 
WHERE column_id = 'xxx' AND position >= 5;
```

## RLS (Row Level Security)

Políticas de segurança:
- Usuários só veem tarefas da sua empresa
- Usuários só podem editar tarefas atribuídas a eles ou da sua empresa

## Migrações

Ver [MIGRATIONS.md](./MIGRATIONS.md) para histórico de mudanças.

---

**Última atualização:** 2026-03-16
