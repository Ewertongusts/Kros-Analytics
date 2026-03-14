# Lógica de Status de Assinaturas e Pagamentos

## Visão Geral

O sistema agora possui dois tipos de status independentes:

1. **Status da Assinatura** (`subscription_status`) - Estado do contrato
2. **Status de Pagamento** (`payment_status`) - Estado financeiro baseado nas faturas

---

## 1. Status da Assinatura (Contrato)

Gerenciado manualmente pelo usuário na coluna "STATUS ASSINATURA".

### Estados Possíveis:

| Status | Descrição | Quando Usar |
|--------|-----------|-------------|
| `active` | Ativa | Assinatura em vigor, gerando faturas normalmente |
| `trial` | Trial/Teste | Período de teste, pode ou não gerar faturas |
| `suspended` | Suspensa | Pausada temporariamente, NÃO gera faturas automáticas |
| `cancelled` | Cancelada | Encerrada permanentemente, NÃO gera mais faturas |

### Ações:
- Usuário pode mudar manualmente clicando no badge
- Suspender/Reativar/Cancelar através de ações em massa
- Não é afetado pelo pagamento das faturas

---

## 2. Status de Pagamento (Financeiro)

Calculado AUTOMATICAMENTE baseado nas faturas geradas.

### Estados Possíveis:

| Status | Label | Cor | Condição |
|--------|-------|-----|----------|
| `paid_up` | Em Dia | Verde | Todas as faturas estão pagas |
| `pending` | Pendente | Amarelo | Tem fatura não paga mas ainda não venceu |
| `overdue` | Em Atraso | Vermelho | Tem fatura vencida (due_date < hoje) |
| `active` | Ativa | Azul | Sem faturas geradas ainda |
| `suspended` | Suspensa | Cinza | Assinatura suspensa |
| `cancelled` | Cancelada | Cinza | Assinatura cancelada |

### Lógica de Cálculo:

```typescript
function calculatePaymentStatus(subscription, invoices) {
  // 1. Se assinatura está suspensa/cancelada, retornar status dela
  if (subscription.status === 'suspended') return 'suspended'
  if (subscription.status === 'cancelled') return 'cancelled'
  
  // 2. Filtrar faturas desta assinatura
  const subscriptionInvoices = invoices.filter(
    inv => inv.company_id === subscription.customer_id
  )
  
  // 3. Se não tem faturas, está ativa
  if (subscriptionInvoices.length === 0) return 'active'
  
  // 4. Verificar se tem fatura vencida
  const hasOverdueInvoice = subscriptionInvoices.some(inv => 
    inv.status === 'pending' && new Date(inv.due_date) < today
  )
  if (hasOverdueInvoice) return 'overdue'
  
  // 5. Verificar se tem fatura pendente (não vencida)
  const hasPendingInvoice = subscriptionInvoices.some(inv => 
    inv.status === 'pending' && new Date(inv.due_date) >= today
  )
  if (hasPendingInvoice) return 'pending'
  
  // 6. Todas as faturas pagas
  return 'paid_up'
}
```

---

## 3. Fluxo de Mudança de Status de Pagamento

```
NOVA ASSINATURA CRIADA
         ↓
    ATIVA (active)
    - Sem faturas geradas
    - Aguardando dia 1 ou botão $
         ↓
    [Dia 1 do mês OU botão $ clicado]
         ↓
    PENDENTE (pending)
    - Fatura gerada com status='pending'
    - due_date >= hoje
         ↓
    [Usuário clica no ✓ e paga]
         ↓
    EM DIA (paid_up)
    - Todas as faturas pagas
    - Nenhuma fatura pendente
         ↓
    [Passa do vencimento sem pagar]
         ↓
    EM ATRASO (overdue)
    - Fatura com due_date < hoje
    - Status ainda 'pending'
         ↓
    [Usuário paga a fatura atrasada]
         ↓
    EM DIA (paid_up)
    - Volta para em dia
```

---

## 4. Geração Automática de Faturas

### Quando Gerar:
- **Dia 1 de cada mês** (via cron job)
- **Manualmente** via botão $ na aba GESTÃO

### Condições para Gerar:
1. Assinatura deve estar `active` ou `trial`
2. NÃO gerar se `suspended` ou `cancelled`
3. Verificar se já existe fatura para o mês atual

### Dados da Fatura:
```typescript
{
  company_id: subscription.customer_id,
  plan_name: subscription.plan_name,
  amount: subscription.amount,
  due_date: new Date(year, month, subscription.due_day),
  status: 'pending',
  sale_type: 'plano',
  notes: 'Fatura gerada automaticamente'
}
```

---

## 5. Aba FATURAS

### O que Mostra:
- TODAS as faturas (pendentes e pagas)
- Filtradas por período (startDate - endDate)
- Para faturas pendentes: usa `due_date`
- Para faturas pagas: usa `paid_at`

### Ações Disponíveis:
- **Botão ✓ (azul)** - Receber pagamento (se status='pending')
- **Botão ↺ (amarelo)** - Estornar pagamento (se status='paid')

---

## 6. Aba GESTÃO

### O que Mostra:
- Todas as assinaturas ativas
- Status da Assinatura (active, suspended, etc)
- Status de Pagamento (calculado automaticamente)

### Ações Disponíveis:
- **Botão $** - Gerar nova fatura manualmente
- **Editar** - Modificar dados da assinatura
- **Suspender/Reativar** - Mudar status da assinatura
- **Excluir** - Remover assinatura (e suas faturas)

---

## 7. Exemplos Práticos

### Exemplo 1: Nova Assinatura
```
1. Criar assinatura para "Empresa X"
   - subscription_status: active
   - payment_status: active (sem faturas)

2. Clicar no botão $ para gerar fatura
   - Cria fatura com due_date = 13/04/2026
   - payment_status: pending

3. Usuário paga a fatura
   - Fatura muda para status='paid'
   - payment_status: paid_up
```

### Exemplo 2: Fatura Vencida
```
1. Assinatura com fatura pendente
   - due_date: 13/03/2026
   - Hoje: 14/03/2026
   - payment_status: overdue (vermelho)

2. Usuário paga a fatura atrasada
   - Fatura muda para status='paid'
   - payment_status: paid_up (verde)
```

### Exemplo 3: Suspender Assinatura
```
1. Assinatura ativa com faturas pendentes
   - subscription_status: active
   - payment_status: pending

2. Usuário suspende a assinatura
   - subscription_status: suspended
   - payment_status: suspended (cinza)
   - NÃO gera mais faturas automáticas
```

---

## 8. Arquivos Modificados

### Criados:
- `app/composables/useSubscriptionStatus.ts` - Lógica de cálculo de status

### Modificados:
- `app/pages/assinaturas.vue` - Integração do cálculo de status
- `app/composables/useSubscriptions.ts` - Geração de faturas com sale_type
- `app/composables/useFinanceHistory.ts` - Filtro para mostrar faturas pendentes
- `app/components/finance/subscription/KPaymentStatusBadge.vue` - Novos status
- `app/components/blocks/KFinanceCollectionTableRow.vue` - Usar payment_status

---

## 9. Próximos Passos (Opcional)

1. **Cron Job** - Implementar geração automática no dia 1
2. **Notificações** - Alertar quando fatura vencer
3. **Relatórios** - Dashboard com métricas de inadimplência
4. **Histórico** - Registrar mudanças de status em payment_history

---

## 10. Notas Importantes

- Status de pagamento é SEMPRE calculado, nunca armazenado
- Mudanças nas faturas atualizam automaticamente o status
- Suspender assinatura NÃO cancela faturas pendentes
- Cancelar assinatura NÃO deleta faturas existentes
- Cada fatura é independente e pode ser paga separadamente
