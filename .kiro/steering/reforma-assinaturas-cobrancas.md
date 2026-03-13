---
inclusion: auto
---

# Reforma: Sistema de Assinaturas e Cobranças

## 🎯 Objetivo da Reforma

Reformar completamente o sistema de assinaturas e cobranças para:
- **Separar claramente** conceitos de ASSINATURA (contrato) vs COBRANÇA (pagamento)
- **Eliminar confusões** de nomenclatura e status
- **Melhorar UX** com informações relevantes e indicadores visuais claros
- **Adicionar funcionalidades** de filtros e ações em massa

## 📊 Problemas Identificados

### 1. Confusão de Status ❌
- **Modal**: "Status Inicial" (Ativo/Pendente/Trial) = status da ASSINATURA
- **Tabela**: "Status" (Pago/Pendente/Atrasado) = status do PAGAMENTO
- **Problema**: Mesma palavra para conceitos diferentes!

### 2. Dados Desconexos ❌
- "Status Inicial" cadastrado não aparece na tabela
- "Cadastro" mostra data do cliente, não da assinatura
- Falta clareza sobre o que cada campo representa

### 3. Falta de Funcionalidades ❌
- Não há filtro por status da assinatura
- Não há ações em massa para suspender/reativar assinaturas
- Indicadores visuais não diferenciam assinatura de pagamento

## 🎨 Solução Proposta

### Conceitos Claros

```
ASSINATURA (Contrato Recorrente)
├── Status: Ativa, Suspensa, Cancelada, Trial
├── Data de Início
├── Cliente
├── Plano
└── Dia de Vencimento (1-31)

COBRANÇA (Pagamento Mensal)
├── Status: Pago, Pendente, Atrasado
├── Data de Vencimento (calculada)
├── Valor
└── Vinculada a uma Assinatura
```

### Mudanças no Modal de Assinatura

**ANTES:**
- ❌ "Status Inicial" (confuso)
- ❌ "Data de Início" (genérico)

**DEPOIS:**
- ✅ "Status da Assinatura" (claro)
- ✅ "Data de Início da Assinatura" (específico)

### Mudanças na Tabela de Cobranças

**COLUNAS ANTES:**
1. Cliente/Parceiro
2. Cadastro (data do cliente) ❌
3. Vencimento
4. Valor
5. LTV Pago
6. Status (pagamento) ❌
7. Último Alerta
8. Ações

**COLUNAS DEPOIS:**
1. Cliente/Parceiro
2. **Início Assinatura** ✅ (substituiu Cadastro)
3. Vencimento
4. Valor
5. LTV Pago
6. **Status Assinatura** ✅ (novo)
7. **Status Pagamento** ✅ (renomeado)
8. Último Alerta
9. Ações

## 📋 Plano de Implementação

### Fase 1: Renomeação e Clareza ✅
**Objetivo**: Eliminar confusões de nomenclatura

**Tarefas:**
1. Renomear "Status Inicial" → "Status da Assinatura" no modal
2. Renomear "Data de Início" → "Data de Início da Assinatura" no modal
3. Renomear coluna "Status" → "Status Pagamento" na tabela
4. Substituir coluna "Cadastro" → "Início Assinatura" na tabela

**Arquivos:**
- `app/components/blocks/KSubscriptionModal.vue`
- `app/components/finance/collection/KCollectionTableHeader.vue`

### Fase 2: Nova Coluna Status Assinatura ✅
**Objetivo**: Mostrar status do contrato na tabela

**Tarefas:**
1. Adicionar coluna "Status Assinatura" na tabela
2. Criar componente de badge para status da assinatura
3. Adicionar indicadores visuais (cores e ícones):
   - 🟢 Ativa (verde)
   - 🟡 Suspensa (amarelo)
   - 🔴 Cancelada (vermelho)
   - 🔵 Trial (azul)
4. Posicionar ao lado de "Status Pagamento"

**Arquivos:**
- `app/components/finance/collection/KCollectionTableHeader.vue`
- `app/components/blocks/KFinanceCollectionTableRow.vue`
- `app/components/finance/collection/KCollectionRowStatus.vue` (novo)

### Fase 3: Filtros por Status da Assinatura ✅
**Objetivo**: Permitir filtrar por status do contrato

**Tarefas:**
1. Adicionar filtro dropdown "Status Assinatura"
2. Implementar lógica de filtro no composable
3. Permitir seleção múltipla
4. Combinar com filtro de status de pagamento (AND)
5. Mostrar contador de resultados

**Arquivos:**
- `app/components/blocks/KFinanceCollectionFilters.vue`
- `app/composables/useCollectionFilters.ts`

### Fase 4: Ações em Massa para Assinaturas ✅
**Objetivo**: Gerenciar múltiplas assinaturas de uma vez

**Tarefas:**
1. Adicionar botões de ação em massa:
   - Suspender Assinaturas
   - Reativar Assinaturas
   - Cancelar Assinaturas
2. Criar modais de confirmação
3. Implementar lógica no composable
4. Registrar ações no histórico
5. Mostrar feedback de sucesso/erro

**Arquivos:**
- `app/components/blocks/KFinanceBatchActionsBar.vue`
- `app/composables/useSubscriptionsManager.ts`
- `app/components/blocks/KBatchSubscriptionActionsModal.vue` (novo)

### Fase 5: Indicadores Visuais Melhorados ✅
**Objetivo**: Diferenciar visualmente assinatura de pagamento

**Tarefas:**
1. Criar badges distintos para Status Assinatura vs Status Pagamento
2. Adicionar ícones específicos para cada status
3. Implementar tooltips explicativos
4. Garantir acessibilidade (contraste, ARIA labels)

**Arquivos:**
- `app/components/finance/collection/KCollectionRowStatus.vue`
- `app/components/ui/KSubscriptionStatusBadge.vue` (novo)
- `app/components/ui/KPaymentStatusBadge.vue` (novo)

### Fase 6: Tooltips e Ajuda Contextual ✅
**Objetivo**: Ajudar usuários a entender os conceitos

**Tarefas:**
1. Adicionar tooltips em labels do modal
2. Adicionar tooltips em headers da tabela
3. Criar textos explicativos concisos
4. Implementar delay de 500ms no hover

**Arquivos:**
- `app/components/blocks/KSubscriptionModal.vue`
- `app/components/finance/collection/KCollectionTableHeader.vue`
- `app/components/ui/KTooltip.vue` (reutilizar existente)

### Fase 7: Feedback e Confirmações ✅
**Objetivo**: Melhorar feedback de ações

**Tarefas:**
1. Adicionar toasts de sucesso para todas as ações
2. Criar confirmações para ações críticas (suspender, cancelar)
3. Mostrar loading states durante processamento
4. Implementar mensagens de erro descritivas

**Arquivos:**
- `app/composables/useSubscriptionsManager.ts`
- `app/composables/useToast.ts` (reutilizar existente)

### Fase 8: Testes e Ajustes Finais ✅
**Objetivo**: Garantir qualidade e usabilidade

**Tarefas:**
1. Testar todos os fluxos de criação/edição
2. Testar filtros e ordenação
3. Testar ações em massa
4. Validar responsividade
5. Verificar acessibilidade
6. Ajustar estilos e espaçamentos

## 🗄️ Estrutura de Dados

### Tabela: subscriptions

**Campos Existentes (sem alteração):**
```sql
- id UUID
- customer_id UUID (FK companies)
- plan_id UUID (FK plans)
- status TEXT (Ativa/Suspensa/Cancelada/Trial)
- start_date DATE (Data de Início da Assinatura)
- due_day INTEGER (1-31)
- amount NUMERIC
- notes TEXT
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

**Mapeamento de Conceitos:**
- `status` = Status da Assinatura
- `start_date` = Data de Início da Assinatura
- `due_day` = Dia de Vencimento

**Status do Pagamento:**
- Calculado dinamicamente baseado em `due_day` e data atual
- Não armazenado no banco (é derivado)

## 🎨 Guia de Estilo Visual

### Cores para Status da Assinatura
```css
Ativa:     bg-emerald-500/10  text-emerald-400  border-emerald-500/20
Suspensa:  bg-yellow-500/10   text-yellow-400   border-yellow-500/20
Cancelada: bg-red-500/10      text-red-500      border-red-500/20
Trial:     bg-blue-500/10     text-blue-400     border-blue-500/20
```

### Cores para Status do Pagamento
```css
Pago:      bg-emerald-500/10  text-emerald-400  border-emerald-500/20
Pendente:  bg-yellow-500/10   text-yellow-400   border-yellow-500/20
Atrasado:  bg-red-500/10      text-red-500      border-red-500/20
```

### Ícones
```
Assinatura Ativa:     ✓ (check)
Assinatura Suspensa:  ⏸ (pause)
Assinatura Cancelada: ✕ (x)
Assinatura Trial:     ⚡ (zap)

Pagamento Pago:       ✓ (check)
Pagamento Pendente:   ⏱ (clock)
Pagamento Atrasado:   ⚠ (alert)
```

## 📝 Nomenclatura Padronizada

### No Código
```typescript
// Assinatura
subscription.status          // 'active' | 'suspended' | 'cancelled' | 'trial'
subscription.start_date      // Date
subscription.due_day         // 1-31

// Cobrança (derivada)
charge.payment_status        // 'paid' | 'pending' | 'overdue'
charge.due_date             // Date calculada
```

### Na Interface
```
Modal:
- "Status da Assinatura"
- "Data de Início da Assinatura"
- "Dia de Vencimento"

Tabela:
- "Status Assinatura" (coluna)
- "Status Pagamento" (coluna)
- "Início Assinatura" (coluna)
```

## ⚠️ Pontos de Atenção

1. **Não alterar schema do banco**: Usar campos existentes
2. **Manter compatibilidade**: Dados antigos devem funcionar
3. **Performance**: Filtros devem ser rápidos mesmo com muitos registros
4. **Responsividade**: Tabela deve funcionar em mobile
5. **Acessibilidade**: Cores devem ter contraste adequado
6. **Consistência**: Usar mesmos padrões visuais do sistema

## 🚀 Status de Implementação

- [ ] Fase 1: Renomeação e Clareza
- [ ] Fase 2: Nova Coluna Status Assinatura
- [ ] Fase 3: Filtros por Status da Assinatura
- [ ] Fase 4: Ações em Massa para Assinaturas
- [ ] Fase 5: Indicadores Visuais Melhorados
- [ ] Fase 6: Tooltips e Ajuda Contextual
- [ ] Fase 7: Feedback e Confirmações
- [ ] Fase 8: Testes e Ajustes Finais

## 📚 Referências

- Spec completo: `.kiro/specs/reforma-sistema-assinaturas-cobrancas/`
- Schema do banco: `.kiro/database-schema.md`
- Steering anterior: `.kiro/steering/refactoring-customers-subscriptions.md`

---

**Criado em:** 2026-03-13
**Última atualização:** 2026-03-13
