# Plano de Refatoração do Sistema de Faturas

## Contexto Atual
O sistema está confuso - o botão $ na tabela principal abre um modal de "Receber Pagamento" que não faz sentido para o fluxo de assinaturas.

## Objetivo Final
Separar claramente a geração de faturas do pagamento de faturas.

---

## FLUXO CORRETO

### 1. TABELA PRINCIPAL (Gestão de Assinaturas)
**Botão $ (Cifrão) - "Gerar Fatura"**
- Ao clicar: Abre modal simples perguntando "Deseja gerar fatura?"
- Opções: "Cancelar" ou "Gerar"
- Ao confirmar: Cria uma nova fatura na tabela `payments` e envia para o histórico

### 2. ABA "FATURAS" (antes chamada "Histórico de Pagamentos")
**Renomear:** "HISTÓRICO DE PAGAMENTOS" → "FATURAS"

**Cada linha de fatura tem:**
- Botão de Pagar/Estornar (igual ao antigo)
  - Se status = 'pending': Mostra ✓ (check azul) → Ao clicar abre modal "RECEBER PAGAMENTO" (aquele que já existe)
  - Se status = 'paid': Mostra ↺ (seta amarela) → Ao clicar abre modal de estorno

---

## TAREFAS DE IMPLEMENTAÇÃO

### ✅ CONCLUÍDO
1. Botão $ sempre visível na tabela principal
2. Ícone de cifrão ($) implementado
3. Modal de estorno criado (KReversePaymentModal.vue)
4. Modal de gerar fatura criado (KGenerateInvoiceModal.vue)
5. Aba renomeada de "HISTÓRICO DE PAGAMENTOS" para "FATURAS"
6. Botões de pagar/estornar adicionados na aba Faturas
7. Handlers implementados (handleGenerateInvoice, handlePayInvoice, handleReverseInvoice)

### ✅ FASE 1: Modal de Gerar Fatura - COMPLETO
- [x] Criar `KGenerateInvoiceModal.vue` (modal simples com "Cancelar" e "Gerar")
- [x] Modificar `handleTogglePaymentStatus` para abrir este modal
- [x] Implementar `handleGenerateInvoice` que:
  - Cria registro em `payments` com status='pending'
  - Registra em `payment_history` com action_type='invoice_generated'
  - Atualiza a UI

### ✅ FASE 2: Renomear Aba - COMPLETO
- [x] Trocar "HISTÓRICO DE PAGAMENTOS" → "FATURAS" na UI
- [x] Atualizar variáveis/refs relacionadas (se necessário)

### ✅ FASE 3: Botões na Aba Faturas - COMPLETO
- [x] Adicionar coluna "Ações" na tabela de faturas
- [x] Implementar botão condicional:
  - Pendente: ✓ azul → Abre modal "RECEBER PAGAMENTO" (já existe)
  - Pago: ↺ amarelo → Abre modal de estorno (já existe)
- [x] Conectar handlers existentes:
  - `handleConfirmPayment` (já existe)
  - `handleReverseInvoice` (implementado)

### ✅ FASE 4: Integração Completa - COMPLETO
- [x] Modal de gerar fatura integrado na página de assinaturas
- [x] Eventos conectados entre componentes
- [x] Handlers de pagar/estornar funcionando
- [x] Histórico de ações registrado em payment_history

---

## ESTRUTURA DE DADOS

### Tabela `payments`
```sql
- id
- company_id
- plan_name
- amount
- due_date
- status ('pending' | 'paid')
- paid_at (null quando pending)
- notes
- created_at
```

### Tabela `payment_history`
```sql
- id
- company_id
- payment_id
- action_type ('invoice_generated' | 'paid' | 'reversed')
- description
- user_id
- user_name
- metadata (JSON)
- created_at
```

---

## FLUXO DE USUÁRIO FINAL

1. **Usuário vê assinatura ativa na tabela**
2. **Clica no botão $ para gerar fatura**
3. **Modal pergunta: "Deseja gerar fatura?" → Confirma**
4. **Fatura criada e aparece na aba "FATURAS"**
5. **Usuário vai na aba "FATURAS"**
6. **Vê a fatura com status "Pendente" e botão ✓**
7. **Clica no ✓ → Abre modal "RECEBER PAGAMENTO"**
8. **Preenche valor/notas → Confirma**
9. **Fatura marcada como "Paga"**
10. **Botão muda para ↺ (estornar)**
11. **Se clicar em ↺ → Abre modal de estorno → Confirma**
12. **Fatura volta para "Pendente"**

---

## NOTAS IMPORTANTES

- O modal "RECEBER PAGAMENTO" (aquele vermelho com TOTAL/PARCIAL) SÓ aparece na aba FATURAS
- O botão $ na tabela principal NUNCA abre o modal de receber pagamento
- Cada fatura é independente - pode gerar múltiplas faturas para a mesma assinatura
- O estorno não deleta a fatura, apenas muda o status de volta para 'pending'

---

## PRÓXIMOS PASSOS
1. Confirmar se o plano está correto
2. Implementar FASE 1 (Modal de Gerar Fatura)
3. Implementar FASE 2 (Renomear Aba)
4. Implementar FASE 3 (Botões na Aba Faturas)
5. Implementar FASE 4 (Limpeza)
