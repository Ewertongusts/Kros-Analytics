# Tasks: Reforma do Sistema de Assinaturas e Cobranças

## Visão Geral

Este documento contém as tarefas de implementação para a reforma completa do sistema de assinaturas e cobranças, seguindo a metodologia de desenvolvimento orientado a especificações com testes baseados em propriedades.

## Estrutura de Implementação

A implementação está organizada em 8 fases sequenciais, cada uma com suas tarefas e sub-tarefas. As fases devem ser executadas em ordem para garantir uma transição suave e minimizar riscos.

## Convenções

- `[ ]` = Tarefa não iniciada
- `[-]` = Tarefa em progresso
- `[x]` = Tarefa concluída
- `[ ]*` = Tarefa opcional (não bloqueia progresso)

---

## Fase 1: Fundação e Tipos Base

### 1. Criar Tipos TypeScript Base

- [ ] 1.1 Criar arquivo `app/types/subscription.ts`
  - [ ] 1.1.1 Definir type `SubscriptionStatus`
  - [ ] 1.1.2 Definir interface `Subscription`
  - [ ] 1.1.3 Definir interface `SubscriptionWithDetails`
  - [ ] 1.1.4 Definir enum `SubscriptionStatusEnum`
  - [ ] 1.1.5 Definir `SubscriptionStatusLabels`

- [ ] 1.2 Criar arquivo `app/types/payment.ts`
  - [ ] 1.2.1 Definir type `PaymentStatus`
  - [ ] 1.2.2 Definir interface `Payment`
  - [ ] 1.2.3 Definir enum `PaymentStatusEnum`
  - [ ] 1.2.4 Definir `PaymentStatusLabels`

- [ ] 1.3 Criar arquivo `app/types/filters.ts`
  - [ ] 1.3.1 Definir interface `FilterOption`
  - [ ] 1.3.2 Definir interface `Tag`
  - [ ] 1.3.3 Definir type `BatchActionType`
