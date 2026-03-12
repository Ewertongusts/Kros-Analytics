# 🔄 PROMPT PARA CONTINUAR COMPONENTIZAÇÃO

## 📋 CONTEXTO ATUAL

Estamos componentizando o sistema Kros Finanças (Nuxt 4 + Vue 3 + TypeScript + Supabase + TailwindCSS).

## ✅ PROGRESSO COMPLETO

### Fases Concluídas (1-7)

**Fase 1:** Modal de vendas (21 componentes) ✅
**Fase 2:** Tabela de vendas (3 componentes) ✅
**Fase 3:** Header e Actions do modal (2 componentes) ✅
**Fase 4:** Composables de lógica (5 composables) ✅
**Fase 5:** Página de vendas (3 componentes + 1 composable) ✅
**Fase 6:** Layout reutilizável (3 componentes) ✅
**Fase 7:** UI Base e Batch Messaging (9 componentes + 1 composable) ✅

### Fase 8: Refatorar Modais ✅ CONCLUÍDA

**Todos os modais refatorados:**
- ✅ KCompanyModal.vue (217 → 200 linhas)
- ✅ KTaskModal.vue (218 → 203 linhas)
- ✅ KPlanModal.vue (→ 156 linhas)
- ✅ KPlanCategoriesModal.vue (→ 127 linhas)
- ✅ KTagModal.vue (→ 105 linhas)
- ✅ KExpenseModal.vue (→ 103 linhas)
- ✅ KFinanceSendMsgModal.vue (229 → 216 linhas)

## 📊 TOTAIS ATUAIS

- **49 componentes** modulares
- **7 composables** reutilizáveis
- **8 páginas** com KPageLayout
- **7 modais** refatorados com KModal
- **0 erros** de diagnóstico

## 🎯 PRÓXIMOS PASSOS

### Fase 9: Componentizar Finance Collection (PRÓXIMA)

Componentizar os 3 maiores componentes de cobrança:

1. **KFinanceCollectionBoard.vue** (432 linhas)
   - Separar filtros, tabela e lógica
   - Criar composable para gerenciamento de estado

2. **KFinanceCollectionTableRow.vue** (316 linhas)
   - Extrair células individuais
   - Componentizar ações da linha

3. **KFinanceCollectionFilters.vue** (286 linhas)
   - Separar cada tipo de filtro
   - Criar componentes reutilizáveis

### Fase 10: Componentizar Boards e Modais Grandes

Após terminar Fase 8, componentizar:
1. **KFinanceCollectionBoard.vue** (432 linhas)
2. **KFinanceCollectionTableRow.vue** (316 linhas)
3. **KFinanceCollectionFilters.vue** (286 linhas)

### Fase 10: Componentizar Boards

1. **KFinanceLogsBoard.vue** (300 linhas)
2. **KFinanceHistoryBoard.vue** (281 linhas)

## 📁 ARQUIVOS IMPORTANTES

### Componentes Base Criados
- `app/components/ui/KModal.vue`
- `app/components/ui/KModalHeader.vue`
- `app/components/ui/KModalActions.vue`
- `app/components/ui/KStatusBadge.vue`
- `app/components/ui/KEmptyState.vue`
- `app/components/ui/KButtonPrimary.vue`
- `app/components/layouts/KPageLayout.vue`

### Composables Criados
- `app/composables/useSaleCalculations.ts`
- `app/composables/useSaleFormatters.ts`
- `app/composables/useSaleForm.ts`
- `app/composables/useSaleData.ts`
- `app/composables/useSaleInstallments.ts`
- `app/composables/useSaleActions.ts`
- `app/composables/useBatchMessaging.ts`

### Documentação
- `.kiro/steering/kros-sales-system.md` - Steering file atualizado
- `.agent/COMPONENTIZATION_SUMMARY.md` - Resumo completo
- `.agent/FINAL_COMPONENTIZATION_REPORT.md` - Relatório final

## 🔧 COMANDOS ÚTEIS

```bash
# Contar linhas de um componente
Get-Content app/components/blocks/NOME.vue | Measure-Object -Line

# Listar componentes grandes (>200 linhas)
Get-ChildItem app/components/blocks/*.vue | ForEach-Object { [PSCustomObject]@{ Name = $_.Name; Lines = (Get-Content $_.FullName | Measure-Object -Line).Lines } } | Where-Object { $_.Lines -gt 200 } | Sort-Object Lines -Descending

# Verificar erros
getDiagnostics(["app/components/blocks/NOME.vue"])
```

## 💡 PADRÕES ESTABELECIDOS

### Nomenclatura
- Prefixo por feature: `KSale*`, `KFinance*`, `KBatch*`
- PascalCase para arquivos
- Auto-import pelo Nuxt 4

### Estrutura
```
app/
├── components/
│   ├── blocks/      # Modais, seções grandes
│   ├── layouts/     # Layouts reutilizáveis
│   ├── ui/          # Componentes UI base
│   ├── sales/       # Componentes de vendas
│   └── finance/     # Componentes financeiros
├── composables/     # Lógica reutilizável
└── pages/           # Rotas do Nuxt
```

### Comunicação
- Props tipadas com TypeScript
- Emits tipados para eventos
- V-model bidirecional com computed
- Composables para lógica compartilhada

## ⚠️ REGRAS IMPORTANTES

1. **SEMPRE** trabalhar 100% componentizado
2. **SEMPRE** usar TypeScript (`<script setup lang="ts">`)
3. **SEMPRE** usar auto-import do Nuxt 4 (não importar manualmente)
4. **SEMPRE** verificar erros com getDiagnostics após mudanças
5. **SEMPRE** usar KModal, KModalHeader, KModalActions para modais
6. **SEMPRE** usar KPageLayout para páginas
7. **SEMPRE** usar KButtonPrimary para botões primários
8. **NUNCA** usar tipagem explícita `: any` em callbacks
9. **NUNCA** criar arquivos markdown de resumo sem solicitação

## 🚀 PROMPT PARA NOVO AGENT

```
Continue a componentização do sistema Kros Finanças. Fase 8 concluída ✅

FASE 8 COMPLETA:
- 7 modais refatorados usando KModal, KModalHeader, KModalActions
- Redução média de 15-20 linhas por modal
- 0 erros de diagnóstico

PRÓXIMO - FASE 9: Finance Collection
Componentizar os 3 maiores componentes de cobrança:

1. KFinanceCollectionBoard.vue (432 linhas)
   - Separar em componentes menores
   - Criar composable para lógica de estado

2. KFinanceCollectionTableRow.vue (316 linhas)
   - Extrair células individuais
   - Componentizar ações

3. KFinanceCollectionFilters.vue (286 linhas)
   - Separar cada filtro
   - Criar componentes reutilizáveis

PADRÃO:
- Componentes < 150 linhas
- Composables para lógica compartilhada
- TypeScript tipado
- 0 erros de diagnóstico

Leia: .agent/CONTINUE_COMPONENTIZATION.md para contexto completo.
```

## 📈 MÉTRICAS DE SUCESSO

- Redução de ~20-30 linhas por modal
- 0 erros de diagnóstico
- Código mais limpo e consistente
- Reutilização de componentes base
- Manutenção centralizada

---

**Status:** Fase 8 concluída ✅ | Próximo: Fase 9 - Finance Collection  
**Data:** Componentização contínua  
**Progresso:** 7/7 modais refatorados com sucesso
