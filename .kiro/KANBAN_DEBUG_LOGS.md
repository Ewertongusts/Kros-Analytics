# 🔍 Guia de Debug - Logs Detalhados do Kanban

## Como Usar os Logs para Resolver o Problema

### 1. Abra o DevTools do Navegador
- Pressione `F12` ou `Ctrl+Shift+I`
- Vá para a aba **Console**

### 2. Recarregue a Página
- Pressione `F5` ou `Ctrl+R`
- Observe os logs que aparecem no console

## 📊 Fluxo de Logs Esperado

### Fase 1: Inicialização da Página
```
🚀 [onMounted] Iniciando página de tarefas...
📥 [onMounted] Buscando colunas...
🔄 [initializeDefaultColumns] Inicializando colunas padrão...
   userId: <seu-user-id>
   Verificando coluna: A Fazer (status: todo)
   📝 Criando coluna padrão: A Fazer
   ✅ Coluna criada: {...}
   Verificando coluna: Em Progresso (status: in_progress)
   📝 Criando coluna padrão: Em Progresso
   ✅ Coluna criada: {...}
   Verificando coluna: Concluído (status: done)
   📝 Criando coluna padrão: Concluído
   ✅ Coluna criada: {...}
✅ [initializeDefaultColumns] Inicialização concluída
✅ [fetchColumns] Colunas recebidas: 3
   Colunas: [
     { id: 'col_todo', name: 'A Fazer', status: 'todo' },
     { id: 'col_in_progress', name: 'Em Progresso', status: 'in_progress' },
     { id: 'col_done', name: 'Concluído', status: 'done' }
   ]
```

### Fase 2: Carregamento de Tarefas
```
📥 [onMounted] Buscando tarefas...
🔍 [fetchTasks] Iniciando busca de tarefas...
👤 [fetchTasks] Usuário atual: <seu-user-id>
✅ [fetchTasks] Tarefas recebidas do banco: 14
   Tarefas: [
     { id: '1', title: 'Tarefa 3', status: 'done' },
     { id: '2', title: 'Tarefa 3', status: 'done' },
     { id: '3', title: 'Tarefa 2', status: 'in_progress' },
     ...
   ]
📦 [fetchTasks] tasks.value atualizado: 14
```

### Fase 3: Renderização do Kanban
```
🔍 [getTasksInColumn] columnId: col_todo
   Colunas disponíveis: [
     { id: 'col_todo', name: 'A Fazer', status: 'todo' },
     { id: 'col_in_progress', name: 'Em Progresso', status: 'in_progress' },
     { id: 'col_done', name: 'Concluído', status: 'done' }
   ]
   Coluna encontrada: { id: 'col_todo', name: 'A Fazer', status: 'todo' }
   Status da coluna: "todo"
   Total de tarefas no sistema: 14
   Tarefas: [
     { id: '1', title: 'Tarefa 3', status: 'done' },
     { id: '2', title: 'Tarefa 3', status: 'done' },
     { id: '3', title: 'Tarefa 2', status: 'in_progress' },
     ...
   ]
   ❌ Tarefa "Tarefa 3" (id: 1, status: "done") - statusMatch: false, notExiting: true
   ❌ Tarefa "Tarefa 3" (id: 2, status: "done") - statusMatch: false, notExiting: true
   ❌ Tarefa "Tarefa 2" (id: 3, status: "in_progress") - statusMatch: false, notExiting: true
   ✅ Tarefas filtradas para coluna "A Fazer": 0
```

## 🔴 Problemas Comuns e Soluções

### Problema 1: Colunas Não Aparecem
**Log esperado:**
```
❌ [fetchColumns] Erro ao buscar colunas: {...}
```

**Solução:**
- Verifique se o usuário está autenticado
- Verifique se a tabela `kanban_columns` existe no Supabase
- Verifique as permissões RLS (Row Level Security)

### Problema 2: Tarefas Não Carregam
**Log esperado:**
```
❌ [fetchTasks] Erro ao buscar tarefas: {...}
```

**Solução:**
- Verifique se a tabela `tasks` existe no Supabase
- Verifique se há tarefas no banco de dados
- Verifique as permissões RLS

### Problema 3: Tarefas Aparecem como Órfãs
**Log esperado:**
```
❌ Tarefa "Tarefa 3" (id: 1, status: "done") - statusMatch: false, notExiting: true
```

**Significado:**
- `statusMatch: false` = O status da tarefa NÃO corresponde ao status da coluna
- `notExiting: true` = A tarefa não está em estado de saída

**Solução:**
- Verifique se as tarefas têm um `status` válido ('todo', 'in_progress', 'done')
- Verifique se as colunas têm um `status` que corresponde aos status das tarefas
- Verifique se as colunas foram criadas corretamente

### Problema 4: Colunas Vazias
**Log esperado:**
```
✅ Tarefas filtradas para coluna "A Fazer": 0
```

**Solução:**
- Verifique se há tarefas com `status: 'todo'` no banco
- Verifique se a coluna tem `status: 'todo'`
- Verifique se as tarefas estão sendo carregadas corretamente

## 🛠️ Checklist de Debug

- [ ] Abrir DevTools (F12)
- [ ] Recarregar página (F5)
- [ ] Verificar se há erros vermelhos no console
- [ ] Procurar por logs com 🚀 (início)
- [ ] Procurar por logs com ✅ (sucesso)
- [ ] Procurar por logs com ❌ (erro)
- [ ] Verificar se as colunas foram criadas
- [ ] Verificar se as tarefas foram carregadas
- [ ] Verificar se as tarefas estão sendo filtradas corretamente
- [ ] Verificar se o status das tarefas corresponde ao status das colunas

## 📝 Exemplo de Saída Completa

```
🚀 [onMounted] Iniciando página de tarefas...
📥 [onMounted] Buscando colunas...
🔄 [initializeDefaultColumns] Inicializando colunas padrão...
   userId: 12345
   Verificando coluna: A Fazer (status: todo)
   ✅ Coluna já existe: { column_id: 'col_todo', name: 'A Fazer', status: 'todo' }
   Verificando coluna: Em Progresso (status: in_progress)
   ✅ Coluna já existe: { column_id: 'col_in_progress', name: 'Em Progresso', status: 'in_progress' }
   Verificando coluna: Concluído (status: done)
   ✅ Coluna já existe: { column_id: 'col_done', name: 'Concluído', status: 'done' }
✅ [initializeDefaultColumns] Inicialização concluída
✅ [fetchColumns] Colunas recebidas: 3
   Colunas: [
     { id: 'col_todo', name: 'A Fazer', status: 'todo' },
     { id: 'col_in_progress', name: 'Em Progresso', status: 'in_progress' },
     { id: 'col_done', name: 'Concluído', status: 'done' }
   ]
📥 [onMounted] Buscando empresas...
✅ [onMounted] Empresas carregadas: 5
📥 [onMounted] Buscando tags...
✅ [onMounted] Tags carregadas: 10
📥 [onMounted] Buscando tarefas...
🔍 [fetchTasks] Iniciando busca de tarefas...
👤 [fetchTasks] Usuário atual: 12345
✅ [fetchTasks] Tarefas recebidas do banco: 14
   Tarefas: [
     { id: '1', title: 'Tarefa 3', status: 'done' },
     { id: '2', title: 'Tarefa 3', status: 'done' },
     { id: '3', title: 'Tarefa 2', status: 'in_progress' },
     { id: '4', title: 'Tarefa 2', status: 'in_progress' },
     { id: '5', title: 'adsd (cópia)', status: 'in_progress' },
     { id: '6', title: 'adsd', status: 'in_progress' },
     { id: '7', title: 'asdasd', status: 'in_progress' },
     { id: '8', title: 'sdsd', status: 'in_progress' },
     { id: '9', title: 'Tarefa 3', status: 'done' },
     { id: '10', title: 'Tarefa 3', status: 'done' },
     { id: '11', title: 'Tarefa 2', status: 'in_progress' },
     { id: '12', title: 'Tarefa 2', status: 'in_progress' },
     { id: '13', title: 'adsd (cópia)', status: 'in_progress' },
     { id: '14', title: 'adsd', status: 'in_progress' }
   ]
📦 [fetchTasks] tasks.value atualizado: 14
✅ [onMounted] Página de tarefas pronta!
🔍 [getTasksInColumn] columnId: col_todo
   Colunas disponíveis: [
     { id: 'col_todo', name: 'A Fazer', status: 'todo' },
     { id: 'col_in_progress', name: 'Em Progresso', status: 'in_progress' },
     { id: 'col_done', name: 'Concluído', status: 'done' }
   ]
   Coluna encontrada: { id: 'col_todo', name: 'A Fazer', status: 'todo' }
   Status da coluna: "todo"
   Total de tarefas no sistema: 14
   Tarefas: [...]
   ❌ Tarefa "Tarefa 3" (id: 1, status: "done") - statusMatch: false, notExiting: true
   ❌ Tarefa "Tarefa 3" (id: 2, status: "done") - statusMatch: false, notExiting: true
   ❌ Tarefa "Tarefa 2" (id: 3, status: "in_progress") - statusMatch: false, notExiting: true
   ❌ Tarefa "Tarefa 2" (id: 4, status: "in_progress") - statusMatch: false, notExiting: true
   ❌ Tarefa "adsd (cópia)" (id: 5, status: "in_progress") - statusMatch: false, notExiting: true
   ❌ Tarefa "adsd" (id: 6, status: "in_progress") - statusMatch: false, notExiting: true
   ❌ Tarefa "asdasd" (id: 7, status: "in_progress") - statusMatch: false, notExiting: true
   ❌ Tarefa "sdsd" (id: 8, status: "in_progress") - statusMatch: false, notExiting: true
   ❌ Tarefa "Tarefa 3" (id: 9, status: "done") - statusMatch: false, notExiting: true
   ❌ Tarefa "Tarefa 3" (id: 10, status: "done") - statusMatch: false, notExiting: true
   ❌ Tarefa "Tarefa 2" (id: 11, status: "in_progress") - statusMatch: false, notExiting: true
   ❌ Tarefa "Tarefa 2" (id: 12, status: "in_progress") - statusMatch: false, notExiting: true
   ❌ Tarefa "adsd (cópia)" (id: 13, status: "in_progress") - statusMatch: false, notExiting: true
   ❌ Tarefa "adsd" (id: 14, status: "in_progress") - statusMatch: false, notExiting: true
   ✅ Tarefas filtradas para coluna "A Fazer": 0
🔍 [getTasksInColumn] columnId: col_in_progress
   Coluna encontrada: { id: 'col_in_progress', name: 'Em Progresso', status: 'in_progress' }
   Status da coluna: "in_progress"
   Total de tarefas no sistema: 14
   ✅ Tarefa "Tarefa 2" (id: 3, status: "in_progress") - statusMatch: true, notExiting: true
   ✅ Tarefa "Tarefa 2" (id: 4, status: "in_progress") - statusMatch: true, notExiting: true
   ✅ Tarefa "adsd (cópia)" (id: 5, status: "in_progress") - statusMatch: true, notExiting: true
   ✅ Tarefa "adsd" (id: 6, status: "in_progress") - statusMatch: true, notExiting: true
   ✅ Tarefa "asdasd" (id: 7, status: "in_progress") - statusMatch: true, notExiting: true
   ✅ Tarefa "sdsd" (id: 8, status: "in_progress") - statusMatch: true, notExiting: true
   ✅ Tarefa "Tarefa 2" (id: 11, status: "in_progress") - statusMatch: true, notExiting: true
   ✅ Tarefa "Tarefa 2" (id: 12, status: "in_progress") - statusMatch: true, notExiting: true
   ✅ Tarefa "adsd (cópia)" (id: 13, status: "in_progress") - statusMatch: true, notExiting: true
   ✅ Tarefa "adsd" (id: 14, status: "in_progress") - statusMatch: true, notExiting: true
   ✅ Tarefas filtradas para coluna "Em Progresso": 10
🔍 [getTasksInColumn] columnId: col_done
   Coluna encontrada: { id: 'col_done', name: 'Concluído', status: 'done' }
   Status da coluna: "done"
   Total de tarefas no sistema: 14
   ✅ Tarefa "Tarefa 3" (id: 1, status: "done") - statusMatch: true, notExiting: true
   ✅ Tarefa "Tarefa 3" (id: 2, status: "done") - statusMatch: true, notExiting: true
   ✅ Tarefa "Tarefa 3" (id: 9, status: "done") - statusMatch: true, notExiting: true
   ✅ Tarefa "Tarefa 3" (id: 10, status: "done") - statusMatch: true, notExiting: true
   ✅ Tarefas filtradas para coluna "Concluído": 4
```

## 🎯 Próximos Passos

1. Recarregue a página
2. Abra o DevTools (F12)
3. Procure pelos logs
4. Compartilhe os logs comigo para que eu possa ajudar a resolver o problema

**Copie e cole os logs aqui para que eu possa analisar!**
