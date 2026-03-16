-- Política temporária para permitir criação de tarefas sem autenticação (apenas para desenvolvimento)
-- REMOVER EM PRODUÇÃO!

-- Remover política restritiva de inserção
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;

-- Criar política temporária que permite inserção sem autenticação
CREATE POLICY "Temporary allow anonymous task creation"
ON public.tasks
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Também permitir SELECT para usuários anônimos
DROP POLICY IF EXISTS "Users can view all tasks" ON public.tasks;

CREATE POLICY "Allow anonymous and authenticated users to view tasks"
ON public.tasks
FOR SELECT
TO anon, authenticated
USING (true);