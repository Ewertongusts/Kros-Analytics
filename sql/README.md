# Scripts SQL - Sistema de Vendas

Execute os scripts SQL na ordem abaixo para configurar o banco de dados:

## 1. Tabela de Perfis de Usuário
```bash
sql/create_user_profiles_table.sql
```
Cria a tabela `user_profiles` para armazenar informações dos usuários (nome, cargo, telefone, etc.)

## 2. Campos de Pagamento
```bash
sql/add_payment_fields_to_companies.sql
```
Adiciona campos de pagamento à tabela `companies`:
- `payment_type` - Tipo de pagamento (Pix, Dinheiro, Cartão, etc.)
- `installments_payment_type` - Tipo de pagamento das parcelas
- `installments` - Número de parcelas
- `down_payment` - Valor da entrada/sinal
- `custom_installments` - Valores personalizados por parcela

## 3. Campos de Juros
```bash
sql/add_interest_fields_to_companies.sql
```
Adiciona campos de juros:
- `interest_rate` - Taxa de juros
- `interest_type` - Tipo de juros (percentual ou fixo)

## 4. Campos de Desconto
```bash
sql/add_discount_fields_to_companies.sql
```
Adiciona campos de desconto:
- `discount_value` - Valor do desconto
- `discount_type` - Tipo de desconto (percentual ou fixo)
- `final_value` - Valor final após desconto

## 5. Status de Pagamento
```bash
sql/add_payment_status_fields_to_companies.sql
```
Adiciona campos de status:
- `payment_status` - Status (paid, pending, scheduled)
- `payment_date` - Data de pagamento/vencimento

## 6. Auditoria
```bash
sql/add_audit_fields_to_companies.sql
```
Adiciona campos de auditoria:
- `created_by`, `created_by_name`, `created_by_email` - Quem criou
- `received_by`, `received_by_name`, `received_by_email` - Quem recebeu
- `received_at` - Quando foi recebido
- `marked_paid_by`, `marked_paid_by_name`, `marked_paid_by_email` - Quem marcou como pago
- `marked_paid_at` - Quando foi marcado como pago

## Como Executar

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole e execute cada script na ordem acima
4. Verifique se não há erros

## Verificação

Após executar todos os scripts, você pode verificar se tudo está correto:

```sql
-- Ver estrutura da tabela user_profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles';

-- Ver estrutura da tabela companies
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'companies'
ORDER BY ordinal_position;
```
