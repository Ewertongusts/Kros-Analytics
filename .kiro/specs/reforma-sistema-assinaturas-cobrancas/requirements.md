# Documento de Requisitos: Reforma do Sistema de Assinaturas e Cobranças

## Introdução

O sistema atual de assinaturas e cobranças apresenta problemas conceituais e de UX que causam confusão aos usuários. Esta reforma visa separar claramente os conceitos de ASSINATURA (contrato recorrente) e COBRANÇA/PAGAMENTO (transação mensal individual), melhorando a experiência do usuário e a clareza das informações exibidas.

### Problemas Identificados

1. **Confusão de Nomenclatura**: "Status Inicial" no modal refere-se ao status da assinatura, enquanto "Status" na tabela refere-se ao status do pagamento
2. **Dados Desconexos**: Informações cadastradas não aparecem na visualização principal
3. **Informações Irrelevantes**: Campo "Cadastro" mostra data de criação do cliente, não da assinatura
4. **Falta de Clareza Visual**: Não há separação visual clara entre conceitos de assinatura e cobrança

### Objetivo da Reforma

Criar um sistema intuitivo que separe visualmente e conceitualmente assinaturas de cobranças, exiba informações relevantes e elimine ambiguidades de nomenclatura.

## Glossário

- **Sistema**: Aplicação web de gestão de assinaturas e cobranças
- **Assinatura**: Contrato recorrente entre cliente e empresa para fornecimento contínuo de serviço
- **Cobrança**: Transação financeira individual gerada mensalmente por uma assinatura
- **Status_Assinatura**: Estado do contrato (Ativa, Suspensa, Cancelada, Trial)
- **Status_Pagamento**: Estado da transação financeira (Pago, Pendente, Atrasado)
- **Modal_Assinatura**: Interface de criação/edição de assinatura
- **Tabela_Cobranças**: Interface principal de visualização de cobranças mensais
- **Cliente**: Pessoa ou empresa que possui assinaturas
- **Plano**: Produto ou serviço recorrente oferecido
- **LTV_Pago**: Lifetime Value - valor total já pago pelo cliente
- **Dia_Vencimento**: Dia do mês (1-31) em que a cobrança vence
- **Data_Início_Assinatura**: Data em que o contrato de assinatura começou

## Requisitos

### Requisito 1: Separação Clara de Conceitos

**User Story:** Como usuário do sistema, quero que assinaturas e cobranças sejam conceitos claramente separados, para que eu não confunda o status do contrato com o status do pagamento.

#### Acceptance Criteria

1. THE Sistema SHALL distinguish between Assinatura and Cobrança as separate domain concepts
2. THE Sistema SHALL display Status_Assinatura and Status_Pagamento as distinct fields with different labels
3. THE Sistema SHALL use consistent terminology across all interfaces for Assinatura and Cobrança
4. THE Sistema SHALL provide visual separation between Assinatura information and Cobrança information

### Requisito 2: Renomeação de Campos no Modal

**User Story:** Como usuário criando uma assinatura, quero que os campos tenham nomes claros e inequívocos, para que eu entenda exatamente o que estou configurando.

#### Acceptance Criteria

1. THE Modal_Assinatura SHALL label the subscription status field as "Status da Assinatura"
2. THE Modal_Assinatura SHALL label the start date field as "Data de Início da Assinatura"
3. THE Modal_Assinatura SHALL maintain existing fields Cliente, Plano, Dia_Vencimento, and Observações
4. THE Modal_Assinatura SHALL display Status_Assinatura options as Ativa, Suspensa, Cancelada, and Trial

### Requisito 3: Adição de Coluna Status da Assinatura

**User Story:** Como usuário visualizando cobranças, quero ver o status da assinatura associada, para que eu saiba se o contrato está ativo ou não.

#### Acceptance Criteria

1. THE Tabela_Cobranças SHALL display a Status_Assinatura column
2. THE Tabela_Cobranças SHALL show Status_Assinatura values as Ativa, Suspensa, Cancelada, or Trial
3. THE Tabela_Cobranças SHALL use distinct visual indicators for each Status_Assinatura value
4. THE Tabela_Cobranças SHALL position Status_Assinatura column adjacent to Status_Pagamento column

### Requisito 4: Renomeação de Coluna Status do Pagamento

**User Story:** Como usuário visualizando cobranças, quero que o status do pagamento tenha um nome claro, para que eu não confunda com o status da assinatura.

#### Acceptance Criteria

1. THE Tabela_Cobranças SHALL label the payment status column as "Status Pagamento"
2. THE Tabela_Cobranças SHALL display Status_Pagamento values as Pago, Pendente, or Atrasado
3. THE Tabela_Cobranças SHALL use distinct visual indicators for each Status_Pagamento value
4. THE Tabela_Cobranças SHALL maintain existing color coding for payment statuses

### Requisito 5: Substituição da Coluna Cadastro

**User Story:** Como usuário visualizando cobranças, quero ver quando a assinatura começou, para que eu saiba há quanto tempo o cliente é assinante.

#### Acceptance Criteria

1. THE Tabela_Cobranças SHALL replace the Cadastro column with Início_Assinatura column
2. THE Tabela_Cobranças SHALL display Data_Início_Assinatura in format DD/MM/YYYY
3. THE Tabela_Cobranças SHALL sort by Início_Assinatura when the column header is clicked
4. THE Tabela_Cobranças SHALL calculate subscription duration based on Data_Início_Assinatura

### Requisito 6: Manutenção de Colunas Existentes

**User Story:** Como usuário do sistema, quero que informações úteis existentes sejam mantidas, para que eu não perca funcionalidades importantes.

#### Acceptance Criteria

1. THE Tabela_Cobranças SHALL maintain Cliente column displaying customer name
2. THE Tabela_Cobranças SHALL maintain Vencimento column displaying due date
3. THE Tabela_Cobranças SHALL maintain Valor column displaying charge amount
4. THE Tabela_Cobranças SHALL maintain LTV_Pago column displaying total paid by customer
5. THE Tabela_Cobranças SHALL maintain Último_Alerta column displaying last message timestamp
6. THE Tabela_Cobranças SHALL maintain Ações column with action buttons

### Requisito 7: Filtro por Status da Assinatura

**User Story:** Como usuário gerenciando cobranças, quero filtrar por status da assinatura, para que eu possa focar em assinaturas ativas, suspensas ou canceladas.

#### Acceptance Criteria

1. THE Sistema SHALL provide a filter control for Status_Assinatura
2. WHEN a Status_Assinatura filter is selected, THE Sistema SHALL display only cobranças matching that status
3. THE Sistema SHALL allow multiple Status_Assinatura values to be selected simultaneously
4. THE Sistema SHALL display a count of filtered results
5. THE Sistema SHALL persist Status_Assinatura filter selection during the session

### Requisito 8: Filtro por Status do Pagamento

**User Story:** Como usuário gerenciando cobranças, quero filtrar por status do pagamento, para que eu possa focar em pagamentos pendentes ou atrasados.

#### Acceptance Criteria

1. THE Sistema SHALL provide a filter control for Status_Pagamento
2. WHEN a Status_Pagamento filter is selected, THE Sistema SHALL display only cobranças matching that status
3. THE Sistema SHALL allow multiple Status_Pagamento values to be selected simultaneously
4. THE Sistema SHALL maintain existing filter functionality for Pago, Pendente, and Atrasado
5. THE Sistema SHALL combine Status_Assinatura and Status_Pagamento filters with AND logic

### Requisito 9: Ações em Massa para Assinaturas

**User Story:** Como usuário gerenciando múltiplas assinaturas, quero realizar ações em massa, para que eu possa gerenciar eficientemente múltiplos contratos.

#### Acceptance Criteria

1. THE Sistema SHALL provide batch action for suspending multiple assinaturas
2. THE Sistema SHALL provide batch action for reactivating multiple assinaturas
3. THE Sistema SHALL provide batch action for canceling multiple assinaturas
4. WHEN a batch action is initiated, THE Sistema SHALL display a confirmation dialog with count of affected assinaturas
5. WHEN a batch action is confirmed, THE Sistema SHALL update all selected assinaturas and display success feedback
6. IF a batch action fails for any assinatura, THEN THE Sistema SHALL display error details and continue processing remaining assinaturas

### Requisito 10: Ações Individuais para Pagamentos

**User Story:** Como usuário gerenciando cobranças, quero marcar pagamentos individuais, para que eu possa atualizar o status de transações específicas.

#### Acceptance Criteria

1. THE Sistema SHALL provide action to mark individual cobrança as Pago
2. THE Sistema SHALL provide action to mark individual cobrança as Pendente
3. WHEN a payment status is changed, THE Sistema SHALL update the display immediately
4. WHEN a payment status is changed, THE Sistema SHALL record the action in payment_history
5. THE Sistema SHALL maintain existing functionality for marking payments

### Requisito 11: Indicadores Visuais para Status da Assinatura

**User Story:** Como usuário visualizando cobranças, quero indicadores visuais claros para status de assinatura, para que eu identifique rapidamente o estado dos contratos.

#### Acceptance Criteria

1. THE Sistema SHALL display Ativa status with green color indicator
2. THE Sistema SHALL display Suspensa status with yellow color indicator
3. THE Sistema SHALL display Cancelada status with red color indicator
4. THE Sistema SHALL display Trial status with blue color indicator
5. THE Sistema SHALL use consistent icon for each Status_Assinatura value
6. THE Sistema SHALL display Status_Assinatura with badge or pill visual style

### Requisito 12: Indicadores Visuais para Status do Pagamento

**User Story:** Como usuário visualizando cobranças, quero indicadores visuais claros para status de pagamento, para que eu identifique rapidamente pagamentos pendentes ou atrasados.

#### Acceptance Criteria

1. THE Sistema SHALL display Pago status with green color indicator
2. THE Sistema SHALL display Pendente status with yellow color indicator
3. THE Sistema SHALL display Atrasado status with red color indicator
4. THE Sistema SHALL maintain existing visual style for payment status indicators
5. THE Sistema SHALL use distinct visual style from Status_Assinatura indicators

### Requisito 13: Tooltips Explicativos

**User Story:** Como usuário novo no sistema, quero tooltips explicativos, para que eu entenda o significado de cada campo e status.

#### Acceptance Criteria

1. WHEN user hovers over Status_Assinatura label, THE Sistema SHALL display tooltip explaining subscription status concept
2. WHEN user hovers over Status_Pagamento label, THE Sistema SHALL display tooltip explaining payment status concept
3. WHEN user hovers over Início_Assinatura label, THE Sistema SHALL display tooltip explaining subscription start date
4. WHEN user hovers over LTV_Pago label, THE Sistema SHALL display tooltip explaining lifetime value calculation
5. THE Sistema SHALL display tooltips within 500 milliseconds of hover

### Requisito 14: Feedback Visual para Ações

**User Story:** Como usuário realizando ações, quero feedback visual imediato, para que eu saiba que minhas ações foram processadas.

#### Acceptance Criteria

1. WHEN a subscription status is changed, THE Sistema SHALL display a success toast notification
2. WHEN a payment status is changed, THE Sistema SHALL display a success toast notification
3. WHEN a batch action completes, THE Sistema SHALL display a summary toast with count of affected records
4. IF an action fails, THEN THE Sistema SHALL display an error toast with descriptive message
5. THE Sistema SHALL update table rows with loading state during action processing

### Requisito 15: Confirmações para Ações Críticas

**User Story:** Como usuário realizando ações críticas, quero confirmações antes de executar, para que eu evite mudanças acidentais.

#### Acceptance Criteria

1. WHEN user initiates suspension of assinatura, THE Sistema SHALL display confirmation dialog
2. WHEN user initiates cancellation of assinatura, THE Sistema SHALL display confirmation dialog
3. WHEN user initiates batch action, THE Sistema SHALL display confirmation dialog with affected count
4. THE Sistema SHALL require explicit confirmation before executing critical actions
5. THE Sistema SHALL allow user to cancel confirmation dialog without executing action

### Requisito 16: Persistência de Dados de Assinatura

**User Story:** Como sistema, quero armazenar corretamente dados de assinatura, para que informações sejam consistentes e recuperáveis.

#### Acceptance Criteria

1. THE Sistema SHALL store Status_Assinatura in subscriptions table status column
2. THE Sistema SHALL store Data_Início_Assinatura in subscriptions table start_date column
3. THE Sistema SHALL store Dia_Vencimento in subscriptions table due_day column
4. WHEN Status_Assinatura changes, THE Sistema SHALL record change in payment_history table
5. THE Sistema SHALL maintain referential integrity between subscriptions and companies tables

### Requisito 17: Cálculo de Próximo Vencimento

**User Story:** Como usuário visualizando cobranças, quero ver o próximo vencimento calculado corretamente, para que eu saiba quando cobrar o cliente.

#### Acceptance Criteria

1. THE Sistema SHALL calculate next due date based on Dia_Vencimento and current date
2. WHEN current day is before Dia_Vencimento, THE Sistema SHALL use current month for due date
3. WHEN current day is after Dia_Vencimento, THE Sistema SHALL use next month for due date
4. THE Sistema SHALL handle month-end edge cases for Dia_Vencimento values 29-31
5. THE Sistema SHALL display calculated due date in Vencimento column

### Requisito 18: Migração de Dados Existentes

**User Story:** Como sistema, quero migrar dados existentes corretamente, para que informações históricas sejam preservadas.

#### Acceptance Criteria

1. THE Sistema SHALL preserve existing subscription records during migration
2. THE Sistema SHALL map existing status values to new Status_Assinatura values
3. THE Sistema SHALL preserve existing start_date values as Data_Início_Assinatura
4. THE Sistema SHALL maintain existing relationships between subscriptions, customers, and plans
5. IF migration encounters invalid data, THEN THE Sistema SHALL log errors without failing entire migration

### Requisito 19: Ordenação de Colunas

**User Story:** Como usuário visualizando cobranças, quero ordenar por qualquer coluna, para que eu possa organizar dados conforme minha necessidade.

#### Acceptance Criteria

1. WHEN user clicks Status_Assinatura column header, THE Sistema SHALL sort by subscription status
2. WHEN user clicks Status_Pagamento column header, THE Sistema SHALL sort by payment status
3. WHEN user clicks Início_Assinatura column header, THE Sistema SHALL sort by start date
4. THE Sistema SHALL toggle between ascending and descending order on repeated clicks
5. THE Sistema SHALL maintain existing sort functionality for other columns

### Requisito 20: Responsividade da Interface

**User Story:** Como usuário acessando de diferentes dispositivos, quero que a interface se adapte, para que eu possa usar o sistema em qualquer tela.

#### Acceptance Criteria

1. THE Sistema SHALL display all columns on desktop viewports wider than 1024 pixels
2. WHEN viewport is smaller than 1024 pixels, THE Sistema SHALL prioritize essential columns
3. THE Sistema SHALL maintain horizontal scroll for table on mobile devices
4. THE Sistema SHALL keep action buttons accessible on all viewport sizes
5. THE Sistema SHALL maintain existing responsive behavior for other components

## Notas Técnicas

### Arquivos Afetados

- `app/components/blocks/KSubscriptionModal.vue` - Renomear labels
- `app/components/finance/collection/KCollectionTableHeader.vue` - Adicionar coluna Status Assinatura, renomear Cadastro
- `app/components/blocks/KFinanceCollectionBoard.vue` - Adicionar filtros e ações em massa
- `app/components/blocks/KFinanceCollectionTableRow.vue` - Adicionar células para novos campos
- `app/pages/assinaturas.vue` - Adaptar dados para novos campos
- `app/composables/useSubscriptionsManager.ts` - Adicionar métodos para ações em massa

### Schema do Banco

A tabela `subscriptions` já possui os campos necessários:
- `status` - Armazena Status_Assinatura
- `start_date` - Armazena Data_Início_Assinatura
- `due_day` - Armazena Dia_Vencimento

Não são necessárias alterações no schema do banco de dados.

### Considerações de Performance

- Filtros devem ser aplicados no lado do cliente para dados já carregados
- Ordenação deve ser eficiente para listas com centenas de registros
- Ações em massa devem processar assinaturas em paralelo quando possível
- Feedback visual deve ser imediato, sem aguardar resposta do servidor

### Considerações de UX

- Cores devem seguir padrão existente do sistema (kros-blue, green, yellow, red)
- Tooltips devem ser concisos e informativos
- Confirmações devem ser claras sobre o impacto da ação
- Feedback deve ser específico e acionável
