# Teste: Descrição do Produto em Comprovantes

## Pré-requisitos
1. Migration executada: `supabase/migrations/20260314_add_description_to_sales.sql`
2. Código atualizado em produção

## Teste 1: Criar Venda com Descrição Automática

### Passos
1. Abrir página de Vendas
2. Clicar em "NOVA VENDA"
3. Selecionar tipo "PRODUTOS"
4. Selecionar um produto do catálogo que tenha descrição

### Verificar
- [ ] Campo "Descrição" é preenchido automaticamente com a descrição do catálogo
- [ ] Descrição aparece no card de detalhes (botão "Ver Detalhes")

---

## Teste 2: Exportar Comprovante como Imagem

### Passos
1. Criar/selecionar uma venda com descrição
2. Clicar no ícone de comprovante (imagem)
3. Selecionar "Exportar como Imagem"

### Verificar
- [ ] Imagem é gerada com sucesso
- [ ] Seção "DESCRIÇÃO" contém:
  - Nome do produto
  - Descrição do produto (abaixo do nome)

---

## Teste 3: Exportar Comprovante como PDF

### Passos
1. Criar/selecionar uma venda com descrição
2. Clicar no ícone de comprovante (PDF)
3. Selecionar "Exportar como PDF"

### Verificar
- [ ] PDF é gerado com sucesso
- [ ] Seção "DESCRIÇÃO" contém:
  - Nome do produto
  - Descrição do produto (abaixo do nome)

---

## Teste 4: Enviar via WhatsApp

### Passos
1. Criar/selecionar uma venda com descrição
2. Clicar no ícone de WhatsApp
3. Confirmar envio

### Verificar
- [ ] Mensagem é enviada com sucesso
- [ ] Mensagem contém:
  - Linha com emoji 📝 e descrição
  - Imagem do comprovante anexada

**Exemplo de mensagem esperada:**
```
🧾 *COMPROVANTE DE VENDA #abc123*

📋 Tipo: PRODUTO
👤 Cliente: João Silva
📦 Item: Celular Samsung Galaxy S24
📝 Descrição: Smartphone com câmera 50MP, tela AMOLED 6.2"...

💰 Valor: R$ 3.999,00
```

---

## Teste 5: Descrição Personalizada

### Passos
1. Criar nova venda
2. Selecionar produto do catálogo
3. Marcar "Personalizar esta venda"
4. Editar o campo de descrição
5. Salvar venda

### Verificar
- [ ] Descrição personalizada é salva
- [ ] Descrição personalizada aparece no comprovante (não a do catálogo)

---

## Teste 6: Venda Personalizada (sem produto do catálogo)

### Passos
1. Criar nova venda
2. Selecionar tipo "PERSONALIZADO"
3. Preencher nome e descrição manualmente
4. Salvar venda

### Verificar
- [ ] Descrição personalizada é salva
- [ ] Descrição aparece no comprovante

---

## Teste 7: Venda sem Descrição

### Passos
1. Criar venda com produto que NÃO tem descrição no catálogo
2. Não preencher descrição manualmente
3. Gerar comprovante

### Verificar
- [ ] Comprovante é gerado sem erro
- [ ] Seção "DESCRIÇÃO" mostra apenas o nome do produto
- [ ] Sem linha de descrição vazia

---

## Checklist Final

- [ ] Descrição aparece em comprovantes de imagem
- [ ] Descrição aparece em comprovantes de PDF
- [ ] Descrição aparece em mensagens de WhatsApp
- [ ] Descrição personalizada sobrescreve descrição do catálogo
- [ ] Comprovantes sem descrição funcionam normalmente
- [ ] Nenhum erro no console do navegador
- [ ] Nenhum erro no servidor

---

## Rollback (se necessário)

Se houver problemas, executar:
```sql
ALTER TABLE sales DROP COLUMN IF EXISTS description;
```

Depois reverter os arquivos de código para a versão anterior.
