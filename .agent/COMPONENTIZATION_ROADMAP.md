# 🗺️ PLANO DE COMPONENTIZAÇÃO COMPLETA - Kros Finanças

**Objetivo:** Componentizar TODOS os arquivos >250 linhas  
**Meta:** 100% do sistema componentizado  
**Prazo:** 4 fases restantes

---

## 📊 STATUS ATUAL

### ✅ Concluído (Fases 1-8)
- KSaleModal: 611 → 331 linhas ✅
- 7 modais refatorados ✅
- KFinanceCollectionBoard: 432 → 249 linhas ✅
- 119 componentes criados ✅
- 22 composables criados ✅

### ⚠️ Pendente (7 arquivos grandes)
1. **KFinanceBatchMsgModal.vue** - 512 linhas
2. **KFinanceCollectionTableRow.vue** - 316 linhas
3. **KFinanceLogsBoard.vue** - 300 linhas
4. **assinaturas.vue** - 290 linhas
5. **KFinanceCollectionFilters.vue** - 286 linhas
6. **KFinanceHistoryBoard.vue** - 281 linhas
7. **KFinanceCrmSettings.vue** - 257 linhas

---

## 🎯 FASE 9: Finance Collection (CONTINUAR)

**Status:** 1/3 concluído  
**Prioridade:** ALTA

### ✅ Concluído
- KFinanceCollectionBoard (432 → 249 linhas)

### 🔄 Em Andamento

#### 9.1 KFinanceCollectionTableRow.vue (316 linhas)
**Objetivo:** Componentizar linha da tabela

**Ações:**
1. Criar `KCollectionRowCompany.vue` - Célula de empresa (avatar + nome + tags)
2. Criar `KCollectionRowTags.vue` - Sistema de tags com picker
3. Criar `KCollectionRowStatus.vue` - Indicador de status
4. Criar `KCollectionRowActions.vue` - Botões de ação
5. Criar `useCollectionRow.ts` - Lógica de formatação e validação

**Meta:** Reduzir para ~150 linhas

#### 9.2 KFinanceCollectionFilters.vue (286 linhas)
**Objetivo:** Componentizar filtros

**Ações:**
1. Criar `KCollectionFilterSearch.vue` - Busca por texto
2. Criar `KCollectionFilterTags.vue` - Filtro de tags
3. Criar `KCollectionFilterStatus.vue` - Filtro de status
4. Criar `KCollectionFilterActions.vue` - Botões de ação (sync, export, config)

**Meta:** Reduzir para ~120 linhas

**Prazo:** 1 sessão

---

## 🎯 FASE 10: Boards Financeiros

**Status:** Não iniciado  
**Prioridade:** ALTA

### 10.1 KFinanceLogsBoard.vue (300 linhas)
**Objetivo:** Componentizar board de logs

**Ações:**
1. Criar `KLogsTableHeader.vue` - Cabeçalho da tabela
2. Criar `KLogsTableRow.vue` - Linha de log
3. Criar `KLogsFilters.vue` - Filtros de logs
4. Criar `useFinanceLogs.ts` - Lógica de logs

**Meta:** Reduzir para ~150 linhas

### 10.2 KFinanceHistoryBoard.vue (281 linhas)
**Objetivo:** Componentizar board de histórico

**Ações:**
1. Criar `KHistoryTableHeader.vue` - Cabeçalho
2. Criar `KHistoryTableRow.vue` - Linha de histórico
3. Criar `KHistoryFilters.vue` - Filtros
4. Criar `useFinanceHistory.ts` - Lógica de histórico

**Meta:** Reduzir para ~140 linhas

**Prazo:** 1 sessão

---

## 🎯 FASE 11: Modal Batch e CRM Settings

**Status:** Não iniciado  
**Prioridade:** MÉDIA

### 11.1 KFinanceBatchMsgModal.vue (512 linhas) 🔥
**Objetivo:** Componentizar modal de envio em massa (MAIOR COMPONENTE)

**Ações:**
1. Criar `KBatchMsgHeader.vue` - Header com progresso
2. Criar `KBatchMsgRecipientCard.vue` - Card de destinatário
3. Criar `KBatchMsgTemplatePreview.vue` - Preview de template
4. Criar `KBatchMsgFilters.vue` - Filtros de envio
5. Criar `KBatchMsgProgress.vue` - Barra de progresso
6. Criar `useBatchMsgModal.ts` - Lógica do modal

**Meta:** Reduzir para ~250 linhas

### 11.2 KFinanceCrmSettings.vue (257 linhas)
**Objetivo:** Componentizar configurações CRM

**Ações:**
1. Criar `KCrmApiSettings.vue` - Configurações de API
2. Criar `KCrmTemplatesList.vue` - Lista de templates
3. Criar `KCrmTemplateEditor.vue` - Editor de template
4. Criar `useCrmSettings.ts` - Lógica de settings

**Meta:** Reduzir para ~120 linhas

**Prazo:** 1-2 sessões

---

## 🎯 FASE 12: Página de Assinaturas

**Status:** Não iniciado  
**Prioridade:** MÉDIA

### 12.1 assinaturas.vue (290 linhas)
**Objetivo:** Componentizar página de assinaturas

**Ações:**
1. Usar `KPageLayout` (já existe)
2. Criar `KSubscriptionsTable.vue` - Tabela de assinaturas
3. Criar `KSubscriptionsFilters.vue` - Filtros
4. Criar `KSubscriptionsActions.vue` - Ações em lote
5. Criar `useSubscriptions.ts` - Lógica de assinaturas

**Meta:** Reduzir para ~120 linhas

**Prazo:** 1 sessão

---

## 📊 CRONOGRAMA

| Fase | Componentes | Linhas Atuais | Meta | Prazo |
|------|-------------|---------------|------|-------|
| 9 (continuar) | 2 componentes | 602 linhas | ~270 linhas | 1 sessão |
| 10 | 2 boards | 581 linhas | ~290 linhas | 1 sessão |
| 11 | Modal + Settings | 769 linhas | ~370 linhas | 1-2 sessões |
| 12 | 1 página | 290 linhas | ~120 linhas | 1 sessão |

**Total:** 2,242 linhas → ~1,050 linhas  
**Economia:** ~1,200 linhas (53% de redução)

---

## 🎯 METAS FINAIS

### Após Conclusão
- **0 componentes** >300 linhas
- **0 páginas** >200 linhas
- **~130 componentes** Vue
- **~28 composables** reutilizáveis
- **100% componentizado** ✅

### Métricas de Sucesso
- ✅ Todos os arquivos <250 linhas
- ✅ 0 erros de diagnóstico
- ✅ Padrões consistentes
- ✅ Lógica em composables
- ✅ UI em componentes

---

## 📋 CHECKLIST POR FASE

### Fase 9 (Continuar)
- [ ] KCollectionRowCompany.vue
- [ ] KCollectionRowTags.vue
- [ ] KCollectionRowStatus.vue
- [ ] KCollectionRowActions.vue
- [ ] useCollectionRow.ts
- [ ] KCollectionFilterSearch.vue
- [ ] KCollectionFilterTags.vue
- [ ] KCollectionFilterStatus.vue
- [ ] KCollectionFilterActions.vue
- [ ] Verificar 0 erros

### Fase 10
- [ ] KLogsTableHeader.vue
- [ ] KLogsTableRow.vue
- [ ] KLogsFilters.vue
- [ ] useFinanceLogs.ts
- [ ] KHistoryTableHeader.vue
- [ ] KHistoryTableRow.vue
- [ ] KHistoryFilters.vue
- [ ] useFinanceHistory.ts
- [ ] Verificar 0 erros

### Fase 11
- [ ] KBatchMsgHeader.vue
- [ ] KBatchMsgRecipientCard.vue
- [ ] KBatchMsgTemplatePreview.vue
- [ ] KBatchMsgFilters.vue
- [ ] KBatchMsgProgress.vue
- [ ] useBatchMsgModal.ts
- [ ] KCrmApiSettings.vue
- [ ] KCrmTemplatesList.vue
- [ ] KCrmTemplateEditor.vue
- [ ] useCrmSettings.ts
- [ ] Verificar 0 erros

### Fase 12
- [ ] KSubscriptionsTable.vue
- [ ] KSubscriptionsFilters.vue
- [ ] KSubscriptionsActions.vue
- [ ] useSubscriptions.ts
- [ ] Refatorar assinaturas.vue
- [ ] Verificar 0 erros

---

## 🚀 PRÓXIMA AÇÃO

**INICIAR AGORA:** Fase 9.1 - KFinanceCollectionTableRow.vue

**Comando para começar:**
```
Continue a componentização. Fase 9.1: Componentizar KFinanceCollectionTableRow.vue (316 linhas).

Criar:
1. KCollectionRowCompany.vue - Célula de empresa
2. KCollectionRowTags.vue - Sistema de tags
3. KCollectionRowStatus.vue - Status
4. KCollectionRowActions.vue - Ações
5. useCollectionRow.ts - Lógica

Meta: Reduzir para ~150 linhas.
```

---

**Plano criado em:** Março 2026  
**Última atualização:** Agora  
**Status:** Pronto para execução
