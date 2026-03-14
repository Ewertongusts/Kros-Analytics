# Guia de Testes: Página de Despesas

## 🎯 Objetivo
Validar que todas as conexões com o banco de dados estão funcionando corretamente e que a reatividade não está quebrada.

## ✅ Checklist de Testes

### Teste 1: Reatividade de Categorias
**Objetivo**: Verificar se categorias aparecem em todos os componentes quando criadas

**Passos**:
1. Abrir página de despesas
2. Ir para aba "Categorias"
3. Clicar "+ Nova Categoria"
4. Preencher:
   - Nome: "Teste Reatividade"
   - Cor: Qualquer cor
5. Clicar "Salvar"
6. Verificar:
   - ✅ Categoria aparece na lista de categorias
   - ✅ Abrir aba "Recorrentes" → Dropdown de categorias tem a nova categoria
   - ✅ Abrir aba "Únicos" → Dropdown de categorias tem a nova categoria
   - ✅ Abrir aba "Todos" → Filtro de categorias tem a nova categoria

**Resultado Esperado**: Categoria aparece em TODOS os componentes imediatamente

**Se Falhar**: Problema de reatividade (aplicar `toRef()`)

---

### Teste 2: Criar Despesa Recorrente
**Objetivo**: Verificar se despesa recorrente é criada e ocorrências são geradas

**Passos**:
1. Ir para aba "Recorrentes"
2. Clicar "+ Nova Despesa"
3. Preencher:
   - Descrição: "Aluguel"
   - Categoria: "Habitação" (ou qualquer uma)
   - Valor: 1500
   - Frequência: "Mensal"
   - Data Início: 01/03/2026
4. Clicar "Salvar"
5. Verificar:
   - ✅ Despesa aparece na aba "Recorrentes"
   - ✅ Ir para aba "Todos" → Deve mostrar ocorrências para os próximos meses

**Resultado Esperado**: Despesa criada e ocorrências geradas automaticamente

**Se Falhar**: Problema com trigger no banco ou com `createRecurringOccurrences()`

---

### Teste 3: Criar Despesa Única
**Objetivo**: Verificar se despesa única é criada e gera uma ocorrência

**Passos**:
1. Ir para aba "Únicos"
2. Clicar "+ Nova Despesa"
3. Preencher:
   - Descrição: "Compra de Livro"
   - Categoria: "Educação" (ou qualquer uma)
   - Valor: 50
   - Data: 15/03/2026
4. Clicar "Salvar"
5. Verificar:
   - ✅ Despesa aparece na aba "Únicos"
   - ✅ Ir para aba "Todos" → Deve mostrar a ocorrência

**Resultado Esperado**: Despesa criada e uma ocorrência gerada

**Se Falhar**: Problema com `createOccurrence()`

---

### Teste 4: Marcar Ocorrência como Paga
**Objetivo**: Verificar se ocorrência é marcada como paga e cria registro de pagamento

**Passos**:
1. Ir para aba "Todos"
2. Encontrar uma ocorrência com status "Pendente"
3. Clicar "Marcar como Pago"
4. Preencher:
   - Data de Pagamento: Hoje
   - Método: "Transferência"
   - Notas: "Pagamento realizado"
5. Clicar "Confirmar"
6. Verificar:
   - ✅ Ocorrência muda para status "Pago"
   - ✅ Ir para aba "Histórico" → Deve mostrar o pagamento
   - ✅ Ir para aba "Métricas" → Deve atualizar os totais

**Resultado Esperado**: Ocorrência marcada como paga e registro criado

**Se Falhar**: Problema com `updateOccurrenceStatus()` ou `createRecord()`

---

### Teste 5: Editar Categoria
**Objetivo**: Verificar se edição de categoria atualiza em tempo real

**Passos**:
1. Ir para aba "Categorias"
2. Encontrar a categoria "Teste Reatividade" criada no Teste 1
3. Clicar ✏️ (editar)
4. Mudar nome para "Teste Reatividade Editada"
5. Clicar "Salvar"
6. Verificar:
   - ✅ Nome atualiza na aba "Categorias"
   - ✅ Abrir aba "Recorrentes" → Dropdown mostra nome atualizado
   - ✅ Abrir aba "Únicos" → Dropdown mostra nome atualizado

**Resultado Esperado**: Categoria atualizada em todos os componentes

**Se Falhar**: Problema de reatividade

---

### Teste 6: Deletar Categoria
**Objetivo**: Verificar se categoria é deletada corretamente

**Passos**:
1. Ir para aba "Categorias"
2. Encontrar a categoria "Teste Reatividade Editada"
3. Clicar 🗑️ (deletar)
4. Confirmar
5. Verificar:
   - ✅ Categoria desaparece da lista
   - ✅ Abrir aba "Recorrentes" → Dropdown não tem mais a categoria
   - ✅ Abrir aba "Únicos" → Dropdown não tem mais a categoria

**Resultado Esperado**: Categoria deletada de todos os componentes

**Se Falhar**: Problema de reatividade ou com `deleteCategory()`

---

### Teste 7: Filtros na Aba "Todos"
**Objetivo**: Verificar se filtros funcionam corretamente

**Passos**:
1. Ir para aba "Todos"
2. Testar cada filtro:
   - **Busca**: Digitar parte da descrição → Deve filtrar
   - **Categoria**: Selecionar uma categoria → Deve mostrar apenas dessa categoria
   - **Status**: Selecionar "Pago" → Deve mostrar apenas pagas
   - **Mês/Ano**: Selecionar um mês → Deve filtrar por mês
   - **Data Range**: Selecionar intervalo → Deve filtrar por data
3. Clicar "Limpar" → Deve resetar todos os filtros

**Resultado Esperado**: Todos os filtros funcionam corretamente

**Se Falhar**: Problema com lógica de filtros

---

### Teste 8: Métricas
**Objetivo**: Verificar se métricas são calculadas corretamente

**Passos**:
1. Ir para aba "Métricas"
2. Verificar cards:
   - **Total Pago**: Soma de todos os pagamentos
   - **Média**: Total / Quantidade
   - **Maior**: Maior valor pago
   - **Menor**: Menor valor pago
3. Verificar gráficos:
   - **Evolução**: Linha mostrando pagamentos por mês
   - **Distribuição**: Pizza mostrando por categoria

**Resultado Esperado**: Métricas calculadas corretamente

**Se Falhar**: Problema com `computed` properties ou dados

---

### Teste 9: Histórico de Pagamentos
**Objetivo**: Verificar se histórico mostra todos os pagamentos

**Passos**:
1. Ir para aba "Histórico"
2. Verificar:
   - ✅ Mostra todos os pagamentos realizados
   - ✅ Ordenado por data (mais recentes primeiro)
   - ✅ Filtros funcionam (categoria, período, método)
   - ✅ Pode deletar um pagamento

**Resultado Esperado**: Histórico funciona corretamente

**Se Falhar**: Problema com `fetchRecords()` ou filtros

---

### Teste 10: Fluxo Completo
**Objetivo**: Testar fluxo completo de uma despesa

**Passos**:
1. Criar categoria "Teste Completo"
2. Criar despesa recorrente "Teste Completo" com essa categoria
3. Ir para "Todos" → Verificar ocorrências
4. Marcar primeira ocorrência como paga
5. Ir para "Histórico" → Verificar pagamento
6. Ir para "Métricas" → Verificar atualização
7. Editar categoria para "Teste Completo Editada"
8. Verificar que nome atualiza em todos os lugares
9. Deletar categoria (deve falhar porque tem despesa)
10. Deletar despesa
11. Deletar categoria (deve funcionar agora)

**Resultado Esperado**: Fluxo completo funciona sem erros

**Se Falhar**: Problema em alguma parte do fluxo

---

## 🔍 Verificações de Console

Abrir DevTools (F12) e verificar:

### ✅ Sem Erros
- Não deve haver erros vermelhos
- Não deve haver warnings de reatividade

### ✅ Logs Esperados
- Logs de `fetchExpenses()`, `fetchCategories()`, `fetchOccurrences()`
- Logs de operações CRUD (create, update, delete)

### ❌ Logs Não Esperados
- Múltiplos logs de "categories.value.length changed"
- Logs de "Erro ao buscar categorias"
- Logs de "Usuário não autenticado"

---

## 📊 Verificações de Banco de Dados

Abrir Supabase SQL Editor e executar:

### Verificar Despesas
```sql
SELECT * FROM expenses WHERE user_id = auth.uid() ORDER BY created_at DESC;
```
Deve mostrar as despesas criadas nos testes.

### Verificar Ocorrências
```sql
SELECT * FROM expense_occurrences WHERE user_id = auth.uid() ORDER BY due_date;
```
Deve mostrar as ocorrências geradas.

### Verificar Pagamentos
```sql
SELECT * FROM payment_records WHERE user_id = auth.uid() ORDER BY payment_date DESC;
```
Deve mostrar os pagamentos realizados.

### Verificar Categorias
```sql
SELECT * FROM categories WHERE user_id = auth.uid() ORDER BY name;
```
Deve mostrar as categorias criadas.

---

## 🚨 Problemas Comuns

### Problema: Categorias Desaparecem
**Causa**: Reatividade quebrada (como no contacts-disappearing-fix)
**Solução**: Aplicar `toRef()` nos componentes

### Problema: Ocorrências Não Aparecem
**Causa**: Trigger não está criando ocorrências automaticamente
**Solução**: Criar trigger no Supabase

### Problema: Pagamentos Não Aparecem
**Causa**: `createRecord()` não está sendo chamado
**Solução**: Verificar se `updateOccurrenceStatus()` chama `createRecord()`

### Problema: Filtros Não Funcionam
**Causa**: Lógica de filtro incorreta
**Solução**: Verificar computed properties nos componentes

### Problema: Erro "Usuário não autenticado"
**Causa**: Usuário não está logado
**Solução**: Fazer login antes de testar

---

## ✅ Checklist Final

- [ ] Teste 1: Reatividade de Categorias ✅
- [ ] Teste 2: Criar Despesa Recorrente ✅
- [ ] Teste 3: Criar Despesa Única ✅
- [ ] Teste 4: Marcar Ocorrência como Paga ✅
- [ ] Teste 5: Editar Categoria ✅
- [ ] Teste 6: Deletar Categoria ✅
- [ ] Teste 7: Filtros ✅
- [ ] Teste 8: Métricas ✅
- [ ] Teste 9: Histórico ✅
- [ ] Teste 10: Fluxo Completo ✅
- [ ] Console sem erros ✅
- [ ] Banco de dados com dados corretos ✅

**Status**: 🟢 Pronto para Produção
