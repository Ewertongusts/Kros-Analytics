-- Script para limpar colunas órfãs e consolidar tarefas

-- 1. Ver todas as colunas
SELECT column_id, name, status FROM kanban_columns ORDER BY created_at DESC;

-- 2. Ver tarefas por coluna
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

-- 3. Deletar colunas órfãs (mantendo apenas as 2 principais)
DELETE FROM kanban_columns 
WHERE column_id NOT IN ('custom_1773627491179', 'custom_1773627493809')
AND column_id IS NOT NULL;

-- 4. Consolidar tarefas órfãs para a coluna padrão (custom_1773627491179)
UPDATE tasks
SET column_id = 'custom_1773627491179'
WHERE column_id NOT IN ('custom_1773627491179', 'custom_1773627493809')
OR column_id IS NULL;

-- 5. Verificar resultado
SELECT 
  column_id,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_count,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
  COUNT(CASE WHEN status = 'done' THEN 1 END) as done_count
FROM tasks
GROUP BY column_id
ORDER BY column_id;

-- 6. Listar tarefas consolidadas
SELECT id, title, status, column_id FROM tasks ORDER BY column_id, created_at DESC;
