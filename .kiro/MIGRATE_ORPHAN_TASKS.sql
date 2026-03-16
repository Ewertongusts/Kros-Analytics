-- Script para migrar tarefas órfãs (column_id = NULL)
-- Essas tarefas serão atribuídas à coluna padrão baseada no seu status

-- 1. Verificar tarefas órfãs
SELECT 
  id, 
  title, 
  status, 
  column_id,
  created_at
FROM tasks
WHERE column_id IS NULL
ORDER BY created_at DESC;

-- 2. Atualizar tarefas órfãs com column_id baseado no status
UPDATE tasks
SET column_id = CASE 
  WHEN status = 'todo' THEN 'col_todo'
  WHEN status = 'in_progress' THEN 'col_in_progress'
  WHEN status = 'done' THEN 'col_done'
  ELSE 'col_todo'
END,
updated_at = NOW()
WHERE column_id IS NULL;

-- 3. Verificar resultado
SELECT 
  id, 
  title, 
  status, 
  column_id,
  updated_at
FROM tasks
WHERE column_id IN ('col_todo', 'col_in_progress', 'col_done')
ORDER BY column_id, created_at DESC;

-- 4. Contar tarefas por coluna
SELECT 
  column_id,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_count,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
  COUNT(CASE WHEN status = 'done' THEN 1 END) as done_count
FROM tasks
WHERE column_id IS NOT NULL
GROUP BY column_id
ORDER BY column_id;
